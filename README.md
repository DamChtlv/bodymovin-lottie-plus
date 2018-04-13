# bodymovin-lottie-plus

Little helper to integrate faster the bodymovin / lottie animations in a html page.

## Installation
Add this to your html:

```<script src="bl-plus.js" type="text/javascript"></script>```

(and be sure to have bodymovin/bodymovin-light/lottie loaded in your html as well)
## Usage
Here's an example of the basic integration process:

```<div data-blp="balloon-animation"></div>```

BLP is looking for the `[data-blp]` attribute to load. 
It's using this element as wrapper for the animation.
The animation name and json file name needs to be the same because
by default it will look in the `assets/js/anims` folder
*(if you're not using custom file path method below).*

## Options

### **File**
To define custom file path for the JSON animation  
`[data-blp-file="http://url.com/path/to/my/animation.json"]`
- Type: `string/path`
- Default: `http://example.com/assets/js/anims`

### **Images**
Sometimes you have non-vector images in an exported animation, images are stored inside an object with name and file path as properties.  
`[data-blp-images="{'Calque_0':'http://url.com/path/to/the/image/Calque_0.png','Calque_1':'http://url.com/path/to/the/image/Calque_01.png'}"]`
- Type: `Object`

### **Loop**
To loop the animation  
`[data-blp-loop="false"]`
- Type: `boolean`
- Default: `false`  
- Options: `true/false`  

### **Autoplay**  
To autoplay the animation using differents triggers  
`[data-blp-autoplay="view"]`
- Type: `boolean/string`
- Default: `"view"`
- Options: `true/false/view`  

### **Speed**  
To manage the speed of the animation, use negative value to play backwards.  
`[data-blp-speed="1"]`
- Type: `integer`
- Default: `1`
- Options: `true/false/view`  

### **Lazyload**
To lazyload the data json file.  
`[data-blp-lazyload="true"]`
- Type: `boolean`
- Default: `true`  
- Options: `true/false` 

### **Preserve Ratio**
To preserve the aspect ratio of the animation  
`[data-blp-preserve-ratio="true"]`
- Type: `boolean`
- Default: `true`  
- Options: `true/false` 

## Advanced Usage
BLP is also making a global variable in the DOM `blplus` to store all the animations instances of a page (type `blplus` in your console).
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
- More triggers (like click or hover on the wrapper animation for example)
- WordPress plugin
## Credits
- DamChtlv
## License
MIT Licence