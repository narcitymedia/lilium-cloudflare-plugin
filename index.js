const Plugin = require(liliumroot + '/base/plugin');
const hooks = require(liliumroot + '/lib/hooks');
const request = require('request');

const CLOUDFLARE_API_PREFIX = "https://api.cloudflare.com/client/v4";

class CloudflareLiliumPlugin extends Plugin {
    clearFiles(_c, urls, done) {
        log('Cloudflare', 'Clearing list of ' + urls.length + ' URLs', 'info');
        const req = {
            url : CLOUDFLARE_API_PREFIX + "/zones/" + _c.cloudflare.site + "/purge_cache", 
            method : 'POST',
            json : true,
            headers : {
                "X-Auth-Email" : _c.cloudflare.email,
                "X-Auth-Key" : _c.cloudflare.authkey
            },
            body : Array.isArray(urls) ? {
                files : urls
            } : {
                purge_everything : urls // Typically the boolean : true
            }
        };
        
        request(req, (err, r, body) => {
            done(body.errors, body);
        });
    }

    register(_c, info, done) {
        log('Cloudflare', 'Binding on content refreshed event', 'info');
        hooks.bind('article_refreshed', 15, pkg => {
            const _c = pkg._c;
            if (!_c.cloudflare) {
                return log('Cloudflare', 'No "cloudflare" key defined for site ' + _c.website.sitetitle, 'info');
            }

            this.clearFiles(_c, [
                (_c.server.protocol + _c.server.url + pkg.article.url), 
                (_c.server.protocol + _c.server.url + pkg.article.url + ".json"), 
                (_c.server.protocol + _c.server.url + pkg.article.url + ".html"), 
                ...((pkg.article.aliases || []).map(url => _c.server.protocol + _c.server.url + url)),
                ...((pkg.article.aliases || []).map(url => _c.server.protocol + _c.server.url + url + ".json"))
            ], (err, body) => {
                if (err.length == 0) {
                    log("Cloudflare", "Cleared Cloudflare cache for post " + pkg.article.url, "success");
                } else {
                    log("Cloudflare", "Error clearing Cloudflare cache", 'warn'); 
                    err.forEach(x => console.log(x));
                }
            });
        });
        
        done();
    }
}

module.exports = new CloudflareLiliumPlugin();
