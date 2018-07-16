(function() {

    /**
     *  Check if the dom element is just barely visible.
     *  @example if (isAnyPartOfElementInViewport($cta)) {
     *    doThat();
     *  }
     *  @param {string} el [DOM element]
     */
    function isAnyPartOfElementInViewport(el) {
        var rect = el.getBoundingClientRect();

        // DOMRect { x: 8, y: 8, width: 100, height: 100, top: 8, right: 108, bottom: 108, left: 8 }
        var windowHeight = (window.innerHeight || document.documentElement.clientHeight);
        var windowWidth  = (window.innerWidth  || document.documentElement.clientWidth);

        // http://stackoverflow.com/questions/325933/determine-whether-two-date-ranges-overlap
        var vertInView = (rect.top  <= windowHeight) && ((rect.top + rect.height) >= 0);
        var horInView  = (rect.left <= windowWidth)  && ((rect.left + rect.width) >= 0);

        return (vertInView && horInView);
    }

    /**
     *  Fallback call to load a file using xhr.
     */
    function loadFile(url, callback) {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", url, true);
      xhr.ontimeout = function() {
          console.error("The request for " + url + " timed out.");
      };
      xhr.onreadystatechange = function() {
          if (xhr.readyState === 4 & xhr.status === 200) {
              callback(xhr.responseText);
          } else {
              console.error(xhr.statusText);
          }
      };
      xhr.send();
    }

    /**
     *  Fonction constructeur pour charger une anim bodymovin
     *  @param {string} el DOM element that contains the animation
     *  @param {[]} blplus Array to store animations instance name
     *  @example loadAnimBM($animContainer, blplus);
     */
    function loadAnimBM(el, blplus) {

        /** Check if animation is already loading / loaded. */
        if (el.classList.contains('loaded') || el.classList.contains('loading')) return;
        el.classList.add('loading');

        if (el              === undefined) return console.error('Missing DOM element as argument');
        if (el.dataset.blp  === undefined) return console.error('Missing [data-blp] attribute on element');
        if (blplus          === undefined) return console.error("blplus is undefined");

        /**
         * If same animation / element is loaded again, we delete the old one.
         * (easier to maintain)
         */
        if (Object.keys(blplus).length > 0) {
            for (var anim in blplus) {
                if (blplus[anim].instance !== undefined) {
                    if (blplus[anim].instance.wrapper.getAttribute("data-blp") === el.getAttribute("data-blp")) {
                        if (blplus.debug) console.warn('[BL+] Animation ' + anim + ' already exists on this element. Deleting the old one.');
                        blplus[anim].instance.destroy();
                        delete blplus[anim];
                    }
                }
            }
        }

        /**
         *  On sanitize le nom de l'anim passé en argument
         *  @param {string} animName
         *  @param {[]} blplus Array to store animations instance name
         */
        function validAnimName(animName, blplus) {

            animName = animName.replace(/-/gi, "_").toLowerCase();

            /**
             *  On check si une instance d'anim a déjà le même nom
             *  que celle qu'on s'apprête à ajouter
             *  @param {string} animName
             *  @param {[]} blplus
             */
            function isAnimNameTaken(animName, blplus) {
                for (var anim in blplus) {
                    if (blplus[anim] === animName) return true;
                }
            }

            if (isAnimNameTaken(animName, blplus)) {
                var animIndex = 0;

                do {
                    if (animIndex > 0) {
                        var nameIsUsed = isAnimNameTaken(animName + animIndex, blplus);
                        if (!nameIsUsed) {
                            var validName = animName + animIndex;
                            /**
                             *  On ajoute notre anim au format objet
                             *  dans l'array globale qui contient les anims
                             */
                            blplus[validName] = {};
                            return validName;
                        }
                    }
                    animIndex++;
                } while (isAnimNameTaken(animName, blplus));
            }

            /**
             *  On ajoute notre anim au format objet
             *  dans l'array globale qui contient les anims
             */
            blplus[animName] = {};
            return animName;
        }

        /**
         *  Fonction pour récupèrer les data json de l'anim
         *  @param {string} el DOM Element
         *  @param {[]} blplus Array to store animations instance name
         */
        function getAnimData(el, animInstanceName, blplus) {

            /** On vérifie que le nom d'une anim est présent dans [data-blp] */
            if (!el.dataset.blp.length)
                return console.error('Missing animation name in data-blp attribute: [data-blp="example-anim"]');

            /** On récupère par défaut les anims dans assets */
            var animPrefix      = '/assets/js/anims/',
                animFileName    = el.dataset.blp,
                animPath        = window.location.href + animPrefix + animFileName + '.json';

            /** On privilégie le lien direct du fichier si il est présent en data attribute */
            if (el.dataset.blpFile !== undefined) {
                if ((/\.(json)$/i).test(el.dataset.blpFile)) {
                    animPath = el.dataset.blpFile;
                } else {
                    return console.error(el.dataset.blpFile + " isn't a JSON file.");
                }
            }

            /** Check for animations images */
            var animImagesFound = false;
            if (el.dataset.blpImages !== undefined && el.dataset.blpImages.length) {
                animImagesFound = true;
            } else if (el.dataset.blpImages !== undefined && el.dataset.blpImages.length === 0) {
                console.error('Missing image(s) file name and path in data-blp-images attribute as JSON format: [data-blp-images="{"my-image":"http://web.test/my-image.png"}"]');
            }

            /**
             *  CACHE
             *  On vérifie que le fichier de l'anim n'est pas déjà chargée
             *  dans une autre instance pour éviter d'appeler plusieurs fois le même fichier
             */
            /* if (blplus !== undefined && Object.keys(blplus).length > 0) {
                for (var anim in blplus) {
                    // console.log(blplus);
                    // console.log("1: " + blplus[anim].file);
                    // console.log("2: " + blplus[animInstanceName].file);
                    if (blplus[anim].file === blplus[animInstanceName].file
                        && blplus[animInstanceName].instance !== undefined
                        && blplus[animInstanceName].instance.animationData !== undefined)
                    {
                        console.log('coucou');
                        blplus[anim].file = animPath;
                        var response = blplus[anim].instance.animationData;
                        return setBodymovinAnim(el, response, animInstanceName, blplus);
                    }
                }
            } */

            /**
             *  URL API (no IE 11 support without polyfill)
             *  polyfill: https://github.com/github/url-polyfill/blob/master/url.js
             */
            var animUrl;
            if (self.location.protocol === "file:") {
                alert("[BL+] Don't open directly html file in the browser, it won't work for security reasons. Please access the html document through real url, vhost or localhost.");
            } else if (self.URL && self.location.hostname !== "localhost") {
                animUrl = new URL(animPath).href;
            } else {
                animUrl = animPath;
            }

            /** Prevent loading of a file that has already been loaded in the DOM */
            for (var anim in blplus) {
                if (blplus[anim].file === animUrl) {
                    if (blplus.debug) console.warn('[BL+] Data for ' + animInstanceName + ' is already loaded.');
                    setBodymovinAnim(el, blplus[anim].instance.animationData, animInstanceName, blplus);
                    blplus[animInstanceName].file = blplus[anim].file;
                    return;
                }
            }

            /**
             *  FETCH API (no IE 11 support without polyfill)
             *  polyfill: https://github.com/github/fetch
             */
            /** Check if browser has support for fetch */
            if (self.fetch) {

                /** Set what we request */
                fetch(animUrl)

                    /** Launch the request */
                    .then(function(response) {

                        /** Check if the request is working */
                        if (response.ok) {

                            /** We format response data as JSON format */
                            response.json().then(function(response) {

                                /** Remove assetsPath & add correct links to images from the response */
                                if (response.assets !== undefined && response.assets.length && animImagesFound) {
                                    for (let i = 0; i < response.assets.length; i++) {
                                        var e = response.assets[i];
                                        if (e.id.match("image")) {
                                            e.u = "";
                                            var animsImages = JSON.parse(el.dataset.blpImages);
                                            for (var animImage in animsImages) {
                                                /** Retrieve asset image name without the format part ('.png') */
                                                var assetImgName = e.p.substr(0, e.p.length - 4);
                                                if (animImage === assetImgName) {
                                                    if ((/\.(gif|jpe?g|tiff|png|webp|apng)$/i).test(animsImages[animImage])) {
                                                      e.p = animsImages[animImage];
                                                    } else {
                                                      return console.error(animsImages[animImage] + " isn't an image.");
                                                    }

                                                    break;
                                                }
                                            }
                                        }
                                    }
                                }

                                blplus[animInstanceName].file = animPath;
                                setBodymovinAnim(el, response, animInstanceName, blplus);
                            });

                        } else {
                            if (blplus.debug) console.error("Fetch - can't find: " + animUrl.pathname);
                        }
                    })

                    /** La requête n'a pas abouti */
                    .catch(function(error) {
                        console.log('Fetch - error: ' + error.message);
                    });

            /** Fallback avec jQuery ajax */
            } else if (self.jQuery) {
                $.ajax({
                    dataType: 'json',
                    url: animUrl,
                }).done(function(data) {
                    setBodymovinAnim(el, data, animInstanceName, blplus);
                });

            /** Fallback very old XHR */
            } else {
                loadFile(animPath, function(response) {
                    blplus[animInstanceName].file = animPath;
                    setBodymovinAnim(el, JSON.parse(response), animInstanceName, blplus);
                });
            }

        }

        var animName = el.dataset.blp,
            animInstanceName = validAnimName(animName, blplus);

        getAnimData(el, animInstanceName, blplus);
    }

    /**
     *  On configure l'instance de l'animation bodymovin
     *  @param {string} el DOM Element
     *  @param {Object} animData Object which contains json data of the animation
     *  @param {[]} blplus Array to store animations instance name
     */
    function setBodymovinAnim(el, animData, animInstanceName, blplus) {

        /**
         *  OPTIONS - Loop
         *  @default false
         */
        var loopMode = false;
        if (el.dataset.blpLoop !== undefined && el.dataset.blpLoop === "true") {
            loopMode = true;
        }

        /**
         *  OPTIONS - Speed
         *  @default 1
         */
        var animSpeed = 1;
        if (el.dataset.blpSpeed !== undefined && el.dataset.blpSpeed.length)
            animSpeed = parseFloat(el.dataset.blpSpeed.replace(/,/, '.'));

        /**
         *  OPTIONS - Autoplay
         *  @default "view"
         */
        var autoplayMode = false,
            autoplayViewMode = true;
        if (el.dataset.blpAutoplay !== undefined && el.dataset.blpAutoplay === "true") {
            autoplayMode = true;
            autoplayViewMode = false;
        } else if (el.dataset.blpAutoplay !== undefined && el.dataset.blpAutoplay === "view") {
            autoplayViewMode = true;
        }

        if (animData === undefined)
            return console.error('animData is not JSON / undefined');

        var optionsAnim = {
            container: el,
            renderer: 'svg',
            loop: loopMode,
            autoplay: autoplayMode,
            rendererSettings: {
                progressiveLoad: false,
                className: 'anim-bm ' + animInstanceName.replace(/_/gi, "-"),
            },
            animationData: animData,
        };

        /**
         *  OPTIONS - Preserve Aspect Ratio (svg renderer only)
         *  @default true
         */
        if (el.dataset.blpPreserveRatio !== undefined && el.dataset.blpPreserveRatio === "false") {
            optionsAnim.rendererSettings.preserveAspectRatio = 'none';
        }

        /**
         *  On utilise le nom de l'anim que l'on définit comme nom de l'instance pour l'animation bodymovin
         *  ce qui nous permet d'interagir avec, plus tard, ex: algues_footer.pause();
         */
        blplus[animInstanceName].instance = self.bodymovin.loadAnimation(optionsAnim);

        /** Set the speed of the animation */
        blplus[animInstanceName].instance.setSpeed(animSpeed);

        /** We check when the anim is loaded. */
        blplus[animInstanceName].instance.addEventListener('DOMLoaded', function() {
            if (blplus.debug) console.log('%c[BL+] ' + animInstanceName + ' is Loaded ✓', 'color: #7ED321;');
            var animClassName = animInstanceName.replace(/_/gi, "-");
            el.classList.replace('loading','loaded');
            el.classList.add(animClassName);

            /** Set the speed of the animation */
            blplus[animInstanceName].instance.setSpeed(animSpeed);

            /** Set playing mode of the animation instance */
            if (autoplayMode) {
                blplus[animInstanceName].instance.goToAndPlay(0);
            } else if (autoplayViewMode) {
                // if (!blplus[animInstanceName].instance.isPaused)
                    blplus[animInstanceName].instance.goToAndStop(0);

                /** SmoothScroll Event Listener (optional) */
                if (self.scrollbar !== undefined) {

                    self.scrollbar.addListener(function isInView() {
                        if (self.scrollbar.isVisible(el)) {
                            if (blplus[animInstanceName].instance.isPaused) {
                                if (blplus.debug) console.log('%c[BL+] ' + animInstanceName + ' is Playing ►', 'color: #0caeff;');
                                blplus[animInstanceName].instance.play();
                            }
                        } else {
                            if (!blplus[animInstanceName].instance.isPaused) {
                                if (blplus.debug) console.log('%c[BL+] ' + animInstanceName + ' is Paused ■', 'color: #FFD806;');
                                blplus[animInstanceName].instance.pause();
                            }
                        }
                    });
                    self.addEventListener("orientationchange resize", function() {
                        if (isAnyPartOfElementInViewport(el)) {
                            if (blplus[animInstanceName].instance.isPaused) {
                                if (blplus.debug) console.log('%c[BL+] ' + animInstanceName + ' is Playing ►', 'color: #0caeff;');
                                blplus[animInstanceName].instance.play();
                            }
                        } else {
                            if (!blplus[animInstanceName].instance.isPaused) {
                                if (blplus.debug) console.log('%c[BL+] ' + animInstanceName + ' is Paused ■', 'color: #FFD806;');
                                blplus[animInstanceName].instance.pause();
                            }
                        }
                    });

                /** Classic window Event Listener */
                } else {

                    self.addEventListener("orientationchange scroll resize", function() {
                        if (isAnyPartOfElementInViewport(el)) {
                            if (blplus[animInstanceName].instance.isPaused) {
                                if (blplus.debug) console.log('%c[BL+] ' + animInstanceName + ' is Playing ►', 'color: #0caeff;');
                                blplus[animInstanceName].instance.play();
                            }
                        } else {
                            if (!blplus[animInstanceName].instance.isPaused) {
                                if (blplus.debug) console.log('%c[BL+] ' + animInstanceName + ' is Paused ■', 'color: #FFD806;');
                                blplus[animInstanceName].instance.pause();
                            }
                        }
                    });
                }
            } else {
                if (!blplus[animInstanceName].instance.isPaused) {
                    blplus[animInstanceName].instance.goToAndStop(0);
                }
            }
        });
    }

    function launchAnims() {

        /** Array associative globale pour stocker les noms des instances bodymovin */
        if (self.blplus === undefined)
            self.blplus = [];

        var blplus = self.blplus;

        /** Variable to toggle debug mode */
        blplus.debug = false;

        /** Animations in the DOM */
        var animations = document.querySelectorAll('[data-blp]');

        animations.forEach(function(el) {
            if (el.dataset.blpLazyload !== undefined && el.dataset.blpLazyload == "false") {
                return loadAnimBM(el, blplus);
            }
            if (isAnyPartOfElementInViewport(el)) {
                loadAnimBM(el, blplus);
            }
            /** Smooth Scroll Event Listener (optional) */
            if (self.scrollbar !== undefined) {
                self.scrollbar.addListener(function isInView() {
                    if (self.scrollbar.isVisible(el)) {
                        loadAnimBM(el, blplus);
                    }
                });
                self.addEventListener("orientationchange resize", function() {
                    if (isAnyPartOfElementInViewport(el)) {
                        return loadAnimBM(el, blplus);
                    }
                });
            /** Classic window Event Listener */
            } else {
                self.addEventListener("orientationchange scroll resize", function() {
                    if (isAnyPartOfElementInViewport(el)) {
                        return loadAnimBM(el, blplus);
                    }
                });
            }
        });

        if (blplus.debug) {
            console.log("[BL+] Animations stored:");
            console.log(blplus);
        }
    }

    /** Init when self/window is loaded */
    self.onload = function() {
        launchAnims();
    }

})(self, self.bodymovin);
