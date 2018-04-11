# bodymovin-lottie-plus

Little helper to integrate faster the bodymovin / lottie animations in a html page.

## Installation
Add this to your html:

`<script src="bl-plus.js" type="text/javascript"></script>`

(and be sure to have bodymovin/bodymovin-light/lottie loaded in your html as well)
## Usage
Here's an example of the basic integration process:

`<div data-blp="balloon-animation"></div>`

BLP is looking for the `[data-blp]` attribute to load. 
It's using this element as wrapper for the animation.

To go further, i added some more options:
- **File path** *(Default: "assets/js/anims/")*
`[data-blp-file="/path/to/my/animation.json"]`
- **Images** *(Sometimes you have non-vector images in an exported animation, images are stored inside an object with name and file path as properties)*
`[data-blp-images="{'Calque_0':'/path/to/the/image/Calque_0.png','Calque_1':'/path/to/the/image/Calque_01.png'}"]`
- **Loop** setting *(Default: false)*
`[data-blp-loop="false"]`
(true, false)
- **Autoplay** setting *(Default: view)*
`[data-blp-autoplay="view"]`
(true, false, view)
- **Speed** setting *(Default: 1)*
`[data-blp-speed="1"]`
(negative value for reverse play)
- **Lazyload** setting *(Default: true)*
`[data-blp-lazyload="true"]`
(true, false)
- **Preserve Ratio** svg setting *(Default: true)*
`[data-blp-preserve-ratio="true"]`
(true, false)
## Advanced Usage
BLP is also making a global variable in the DOM "`blplus`" to store all the animations instances of a page (type "`blplus`" in your console).
Useful if you need to tweak even more some animations, to use them as transition of a page for example, you might need to stop or play an animation at a specific time.
You can do it like this in javascript: `blplus.my_transition_animation.instance.goToAndPlay(0)`
## Contributing
1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :)
## History
- 1.0 : Added 'loop', 'autoplay', 'file', 'speed', 'lazyload', 'images', 'preserve ratio' features.
#### Features to expect in the future:
- Cache (to prevent loading multiple times the same file for differents animations instances)
- WordPress plugin
## Credits
- DamChtlv
## License
MIT Licence