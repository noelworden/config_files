// ==================================================================================================
//
// Check for Twitter Embed, Run Script if Present
//
// ==================================================================================================
const twitterScript = () => {
  let props = {
    isEnabled : false
  };

  const confirmTwitter = () => {
     if (document.getElementsByClassName('twitter-tweet').length !== 0) {
       const script = document.createElement("script");
       script.type = "text/javascript";
       script.async="";
       script.defer="";
       script.src = "//platform.twitter.com/widgets.js";

       document.body.appendChild(script);
     }
  }


  // Enable
  // ------------------------------------------------
  const enable = () => {
    if (props.isEnabled) return;
    props.isEnabled = true;

    return;
  }

  // Disable
  // ------------------------------------------------
  const disable = () => {
    if (!props.isEnabled) return;
    props.isEnabled = false;

    return;
  }

  // Init
  // ------------------------------------------------
  const init = () => {
    confirmTwitter();
    enable();
    return;
  }

  return {
    init,
    enable,
    disable
  };
}

export default twitterScript;
