# lilium-cloudflare-plugin
Spare time project. This is a small Lilium plugin communicating with the Cloudflare API to ensure cache stability.

## Usage
Add a `cloudflare` key to your website settings, and include a user email, API key, and zone ID like so : 
```
{
    "cloudflare" : {
        "email" : "your@email.com",
        "authkey" : "abcdef.......123456",
        "site" : "abc.......123"
    }
}
```

## Details
For now, the plugin will only send a request to clear all URL versions of an article once it is refreshed.
