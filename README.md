# Pictionary
Pictionary is a charades-inspired word drawing and guessing game.

## Installation

As it has no back end, it only needs a simple server.
The only setting needed is to forward all requests to nonexistent files to `index.html`.

E.g. with nginx:

```nginx
location / {
    try_files $uri /index.html;
    root   {your-root-folder};
    index  index.html;
}
```

Or you can use a simple Node.js server too, or just deploy it to GitHub Pages like I did.
 
## Usage

Just spin up your server and visit the website. You're good to use it.

## Features

 - Uses React and Redux (from CDN)
 - Uses PeerJS for connecting the players.
 - No Babel, Webpack etc. needed

## Links

 - GitHub: https://github.com/vdavid/pictionary/
