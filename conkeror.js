
homepage = "campfire";

url_remoting_fn = load_url_in_new_buffer;

download_buffer_automatic_open_target = OPEN_NEW_BUFFER_BACKGROUND;

cwd = get_home_directory();
cwd.append("Downloads");

content_handlers.set("application/pdf", content_handler_save);

external_content_handlers.set("application/pdf", "evince");
external_content_handlers.set("video/*", "mplayer");

editor_shell_command = "emacsclient -c";

view_source_use_external_editor = true;

xkcd_add_title = true;

// My webjumps
define_webjump("campfire", "http://crystalcommerce.campfirenow.com/room/287132");
define_webjump("lighthouse", "http://crystalcommerce.lighthouseapp.com");
define_webjump("hoptoad", "http://crystalcommerce.hoptoadapp.com");
define_webjump("github", "http://github.com");
define_webjump("gh", "http://github.com/search?q=%s&type=Everything&repo=&langOverride=&start_value=1");
define_webjump("rtm", "http://rememberthemilk.com");
define_webjump("buildserver", "http://crystal-build.endoftheinternet.org");
define_webjump("g", "http://www.google.com/search?q=%s");
define_webjump("thesaurus", "http://thesaurus.com/browse/%s");
define_webjump("gmail", "http://gmail.com");
define_webjump("yammer", "www.yammer.com/");

// Keys
define_key(content_buffer_normal_keymap, "F", "follow-new-buffer");

// Instapaper
interactive("instapaper", "Send the current page to InstaPaper.",
  function(I) {
    check_buffer(I.buffer, content_buffer);
    let posturl = 'https://www.instapaper.com/api/add?' +
                    'username=rhburrows@gmail.com&' +
                    'password=PASSWORD&url=' +
                    encodeURIComponent(I.window.content.location.href) +
                    '&selection=' +
                    encodeURIComponent(
                      (yield I.minibuffer.read(
                         $prompt = "Description (optional): ")));
    try {
      var content = yield send_http_request(load_spec({ uri: posturl }));
      if (content.responseText == "201") {
        I.window.minibuffer.message("Error.");
      }
    } catch (e) {
      I.window.minibuffer.message("Error.");
    }
  });

interactive("instapaper-link", "Send the current link to Instapaper.",
  function(I) {
    var bo = yield read_browser_object(I);
    var mylink = load_spec_uri_string(load_spec(encodeURIComponent(bo)));
    check_buffer(I.buffer, content_buffer);
    let posturl = 'https://www.instapaper.com/api/add?' +
                    'username=USERNAME&' +
                    'password=PASSWORD&url=' + mylink +
                    '&title=' + encodeURIComponent(
                      (yield I.minibuffer.read(
                         $prompt = "Title (optional): ",
                         $initial_value = bo.textContent))) +
                    '&selection=' + encodeURIComponent(
                      (yield I.minibuffer.read(
                         $prompt = "Description (optional): ",
                         $initial_value = "From: "+ I.buffer.title +
                           " ("+I.window.content.location.href+")")));
    try {
      var content = yield send_http_request(load_spec({uri: posturl}));
      if (content.responseText == "201") {
        I.window.minibuffer.message("InstaPaper ok!");
      } else {
        I.window.minibuffer.message("Error.");
      }
    } catch (e) {
      I.window.minibuffer.message("Error.");
    }
  }, $browser_object = browser_object_links);

define_key(default_global_keymap, "C-x i", "instapaper");
define_key(default_global_keymap, "C-x I", "instapaper-link");

require('extensions/noscript.js');

function darken_page(I) {
  var styles='* { background: #111 !important; color: grey !important; }'+
    ':link, :link * { color: #4986dd !important; }'+
    ':visited, :visited * { color: #d75047 !important; }';
  var document = I.buffer.document;
  var newSS=document.createElement('link');
  newSS.rel='stylesheet';
  newSS.href='data:text/css,'+escape(styles);
  newSS.id='conkeror-darken-page-ss';
  document.getElementsByTagName("head")[0].appendChild(newSS);
}

function lighten_page(I) {
  var document = I.buffer.document;
  var ss = document.getElementById('conkeror-darken-page-ss');
  ss.parentNode.removeChild(ss);
}
interactive("lighten-page", "Remove the darkenedness from the page.",
            lighten_page);

interactive("darken-page", "Darken the page in an attempt to save your eyes.",
            darken_page);
define_key(content_buffer_normal_keymap, "C-d", "darken-page");

// Ask before closing the window
add_hook("window_before_close_hook",
  function() {
    var w = get_recent_conkeror_window();
    var result = (w == null) ||
      "y" == (yield w.minibuffer.read_single_character_option(
                $prompt = "Quit Conkeror? (y/n)",
                $options = ["y", "n"]));
    yield co_return(result);
  });

// Firebug
define_variable("firebug_url",
  "http://getfirebug.com/releases/lite/latest/firebug-lite.js");
function firebug(I) {
  var doc = I.buffer.document;
  var script = doc.createElement('script');
  script.setAttribute('type', 'text/javascript');
  script.setAttribute('src', firebug_url);
  script.setAttribute('onload', 'firebug.init();');
  doc.body.appendChild(script);
}
interactive("firebug", "open firebug lite", firebug);

// darkened xul theme
theme_load_paths.push("~/conkeror/themes/");
theme_load("blackened");