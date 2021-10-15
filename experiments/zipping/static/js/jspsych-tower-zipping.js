/**
 * jspsych-image-keyboard-response
 * Josh de Leeuw
 *
 * plugin for displaying a stimulus and getting a keyboard response
 *
 * documentation: docs.jspsych.org
 *
 **/


jsPsych.plugins["tower-zipping"] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('tower-zipping', 'stimulus', 'image');
  jsPsych.pluginAPI.registerPreload('tower-zipping', 'part_a_stimulus', 'image');
  jsPsych.pluginAPI.registerPreload('tower-zipping', 'part_b_stimulus', 'image');

  plugin.info = {
    name: 'tower-zipping',
    description: '',
    parameters: {
      composite_id: {
        type: jsPsych.plugins.parameterType.STRING,
        default: 'wides_025_023',
      },
      part_a_id: {
        type: jsPsych.plugins.parameterType.STRING,
        default: '025',
      },
      part_b_id: {
        type: jsPsych.plugins.parameterType.STRING,
        default: '023',
      },
      compatibleCondition: {
        type: jsPsych.plugins.parameterType.STRING,
        default: 'None',
      },
      participantCondition: {
        type: jsPsych.plugins.parameterType.STRING,
        default: 'None',
      },
      part_a_stimulus: { // link to image
        type: jsPsych.plugins.parameterType.IMAGE,
        pretty_name: 'Part A stimulus',
        default: 'https://lax-tower-4-block-unique-silhouettes-png.s3.amazonaws.com/tower_4_block_unique_silhouettes_025.png',
        description: 'Bottom or left part'
      },
      part_b_stimulus: { // link to image
        type: jsPsych.plugins.parameterType.IMAGE,
        pretty_name: 'Part B stimulus',
        default: 'https://lax-tower-4-block-unique-silhouettes-png.s3.amazonaws.com/tower_4_block_unique_silhouettes_023.png',
        description: 'Top or right part'
      },
      part_type: {
        type: jsPsych.plugins.parameterType.STRING,
        default: "wide",
      },
      stim_URL_stem: {
        type: jsPsych.plugins.parameterType.STRING,
        default: 'https://tower-4-block-unique-silhouettes-composite-silhouette-png.s3.amazonaws.com/',
      },
      stimulus: { // link to image
        type: jsPsych.plugins.parameterType.IMAGE,
        pretty_name: 'Stimulus',
        default: 'https://tower-4-block-unique-silhouettes-composite-silhouette-png.s3.amazonaws.com/tower_4_block_unique_silhouette_composites_silhouette_talls_122_127.png',
        description: 'The image to be displayed'
      },
      stimulus_height: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Image height',
        default: null,
        description: 'Set the image height in pixels'
      },
      stimulus_width: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Image width',
        default: null,
        description: 'Set the image width in pixels'
      },
      maintain_aspect_ratio: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Maintain aspect ratio',
        default: true,
        description: 'Maintain the aspect ratio after setting width or height'
      },
      choices: {
        type: jsPsych.plugins.parameterType.KEY,
        array: true,
        pretty_name: 'Choices',
        default: ['z','m'],
        description: 'The keys the subject is allowed to press to respond to the stimulus.'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed below the stimulus.'
      },
      compositeDuration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Composite duration',
        default: null,
        description: 'How long to display composite tower for.'
      },
      chunkDuration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Chunk duration',
        default: null,
        description: 'How long to display chunks for.'
      },
      stimulus_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Stimulus duration',
        default: null,
        description: 'How long to hide the stimulus.'
      },
      // max_response_duration: { // added by me
      //   type: jsPsych.plugins.parameterType.INT,
      //   pretty_name: 'Max response duration',
      //   default: null,
      //   description: 'How long to respond.'
      // },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'How long to show trial before it ends.'
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: true,
        description: 'If true, trial will end when subject makes a response.'
      },
      render_on_canvas: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Render on canvas',
        default: false,
        description: 'If true, the image will be drawn onto a canvas element (prevents blank screen between consecutive images in some browsers).'+
          'If false, the image will be shown via an img element.'
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    var height, width;
    if (trial.render_on_canvas) { // not used here
      // var image_drawn = false;
      // // first clear the display element (because the render_on_canvas method appends to display_element instead of overwriting it with .innerHTML)
      // if (display_element.hasChildNodes()) {
      //   // can't loop through child list because the list will be modified by .removeChild()
      //   while (display_element.firstChild) {
      //     display_element.removeChild(display_element.firstChild);
      //   }
      // }
      // // create canvas element and image
      // var canvas = document.createElement("canvas");
      // canvas.id = "jspsych-image-keyboard-response-stimulus";
      // canvas.style.margin = 0;
      // canvas.style.padding = 0;
      // var ctx = canvas.getContext("2d");
      // var img = new Image();   
      // img.onload = function() {
      //   // if image wasn't preloaded, then it will need to be drawn whenever it finishes loading
      //   if (!image_drawn) {
      //     getHeightWidth(); // only possible to get width/height after image loads
      //     ctx.drawImage(img,0,0,width,height);
      //   }
      // };
      // img.src = trial.stimulus;

      // // get/set image height and width - this can only be done after image loads because uses image's naturalWidth/naturalHeight properties
      // function getHeightWidth() {
      //   if (trial.stimulus_height !== null) {
      //     height = trial.stimulus_height;
      //     if (trial.stimulus_width == null && trial.maintain_aspect_ratio) {
      //       width = img.naturalWidth * (trial.stimulus_height/img.naturalHeight);
      //     }
      //   } else {
      //     height = img.naturalHeight;
      //   }
      //   if (trial.stimulus_width !== null) {
      //     width = trial.stimulus_width;
      //     if (trial.stimulus_height == null && trial.maintain_aspect_ratio) {
      //       height = img.naturalHeight * (trial.stimulus_width/img.naturalWidth);
      //     }
      //   } else if (!(trial.stimulus_height !== null & trial.maintain_aspect_ratio)) {
      //     // if stimulus width is null, only use the image's natural width if the width value wasn't set 
      //     // in the if statement above, based on a specified height and maintain_aspect_ratio = true
      //     width = img.naturalWidth;
      //   }
      //   canvas.height = height;
      //   canvas.width = width;
      // }
      // getHeightWidth(); // call now, in case image loads immediately (is cached)
      // // add canvas and draw image
      // display_element.insertBefore(canvas, null);
      // if (img.complete && Number.isFinite(width) && Number.isFinite(height)) {
      //   // if image has loaded and width/height have been set, then draw it now
      //   // (don't rely on img onload function to draw image when image is in the cache, because that causes a delay in the image presentation)
      //   ctx.drawImage(img,0,0,width,height);
      //   image_drawn = true;  
      // }
      // // add prompt if there is one
      // if (trial.prompt !== null) {
      //   display_element.insertAdjacentHTML('beforeend', trial.prompt);
      // }

    } else {

      // display stimulus as an image element
      var html = '<img src="'+trial.stimulus+'" id="jspsych-image-keyboard-response-stimulus">';

      html += '<div class="parts">'

      // part_class = trial.part_type == 'tall' ? 'part_stimulus_tall' : 'part_stimulus_wide';

      part_class = trial.part_type == 'tall' ? 'tall' : 'wide';
      
      // positions contingent on tall/wide 
      if (trial.part_type == 'tall') {
        html += '<img src="'+trial.part_a_stimulus+'" class="part-stimulus ' + part_class + '" id="left-stimulus">';
        html += '<img src="'+trial.part_b_stimulus+'" class="part-stimulus ' + part_class + '" id="right-stimulus">';
      } else {
        html += '<img src="'+trial.part_b_stimulus+'" class="part-stimulus ' + part_class + '" id="top-stimulus">';
        html += '<img src="'+trial.part_a_stimulus+'" class="part-stimulus ' + part_class + '" id="bottom-stimulus">';
      };

      html += '<p id="please-respond">Respond! "Z" for NO, "M" for YES.</p>'

      // // positions shown side by side 
      // part_class = trial.part_type == 'tall' ? 'part_stimulus_tall_aligned' : 'part_stimulus_wide_aligned';
      
      // html += '<img src="'+trial.part_a_stimulus+'" class="part_stimulus ' + trial.part_type + '" id="part_a_stimulus">';
      // html += '<img src="'+trial.part_b_stimulus+'" class="part_stimulus ' + trial.part_type + '" id="part_b_stimulus">';
      
      html += '</div>'
      // add prompt
      if (trial.prompt !== null){
        html += trial.prompt;
      }
      // update the page content
      display_element.innerHTML = html;

      // // set image dimensions after image has loaded (so that we have access to naturalHeight/naturalWidth)
      // var img = display_element.querySelector('#jspsych-image-keyboard-response-stimulus');
      // if (trial.stimulus_height !== null) {
      //   height = trial.stimulus_height;
      //   if (trial.stimulus_width == null && trial.maintain_aspect_ratio) {
      //     width = img.naturalWidth * (trial.stimulus_height/img.naturalHeight);
      //   }
      // } else {
      //   height = img.naturalHeight;
      // }
      // if (trial.stimulus_width !== null) {
      //   width = trial.stimulus_width;
      //   if (trial.stimulus_height == null && trial.maintain_aspect_ratio) {
      //     height = img.naturalHeight * (trial.stimulus_width/img.naturalWidth);
      //   }
      // } else if (!(trial.stimulus_height !== null & trial.maintain_aspect_ratio)) {
      //   // if stimulus width is null, only use the image's natural width if the width value wasn't set 
      //   // in the if statement above, based on a specified height and maintain_aspect_ratio = true
      //   width = img.naturalWidth;
      // }
      // img.style.height = height.toString() + "px";
      // img.style.width = width.toString() + "px";

    }

    // store response
    var response = {
      rt: null,
      key: null
    };

    // function to end trial when it is time
    var end_trial = function() {

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // kill keyboard listeners
      if (typeof keyboardListener !== 'undefined') {
        jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      }

      // gather the data to store for the trial
      var trial_data = {
        rt: response.rt,
        stimulus: trial.stimulus,
        response: response.key,
        response_correct: trial.response_correct,
        stimURL: stimURL,
        chunk_id: trial.composite_id,
        rep: trial.rep,
        block_number: trial.blockNumber,
        composite_duration: trial.compositeDuration,
        chunk_duration: trial.chunkDuration,
        participant_condition: trial.participantCondition,
        compatible_trial: trial.compatibleCondition == trial.participantCondition,
        validity: trial.validity,
        talls_name: trial.talls_name,
        wides_name: trial.wides_name,
        part_type: trial.part_type,
        part_a: trial.part_a_id,
        part_b: trial.part_b_id,
        compatible_condition: trial.compatibleCondition
      };

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

    // function to handle responses by the subject
    var after_response = function(info) {

      $('.part-stimulus').hide();
      $('#please-respond').hide();
      $('#please-respond').css('color', 'white');

      // only record the first response
      if (response.key == null) {
        response = info;
      }

      response_correct = (response.key == 'm' & trial.validity=='valid') | (response.key == 'z' & trial.validity=='invalid');
      response_class = response_correct ? 'responded_correct' : 'responded_incorrect'
      
      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      display_element.querySelector('#jspsych-image-keyboard-response-stimulus').className += (' ' + response_class);

      $('#jspsych-image-keyboard-response-stimulus').show();

      trial.response_correct = response_correct;

      if (trial.response_ends_trial) {
        setTimeout(end_trial, 300);
      }
    };

    // // start the response listener
    // if (trial.choices != jsPsych.NO_KEYS) {
    //   var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
    //     callback_function: after_response,
    //     valid_responses: trial.choices,
    //     rt_method: 'performance',
    //     persist: false,
    //     allow_held_key: false
    //   });
    // }

    // hide stimulus if stimulus_duration is set
    if (trial.stimulus_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        display_element.querySelector('#jspsych-image-keyboard-response-stimulus').hide();
      }, trial.stimulus_duration);
    }

    if (trial.compositeDuration !== null) {
      $('#jspsych-image-keyboard-response-stimulus').show();
      $('.part-stimulus').hide();
      $('#please-respond').hide();

      jsPsych.pluginAPI.setTimeout(function() {
    
        $('#jspsych-image-keyboard-response-stimulus').hide();
        $('.part-stimulus').show();
        
        // start the response listener
        if (trial.choices != jsPsych.NO_KEYS) {
          var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
            callback_function: after_response,
            valid_responses: trial.choices,
            rt_method: 'performance',
            persist: false,
            allow_held_key: false
          });
        };

        // Add mask in here if needed

        jsPsych.pluginAPI.setTimeout(function() {
          $('.part-stimulus').hide();
          $('#please-respond').show();

        }, trial.chunkDuration);

      }, trial.compositeDuration);
    };

    // end trial if trial_duration is set
    if (trial.trial_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.trial_duration);
    } else if (trial.response_ends_trial === false) {
      console.warn("The experiment may be deadlocked. Try setting a trial duration or set response_ends_trial to true.");
    }
  };

  return plugin;
})();
