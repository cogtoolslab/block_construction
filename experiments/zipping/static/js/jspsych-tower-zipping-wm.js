/**
 * jspsych-image-keyboard-response
 * Josh de Leeuw
 *
 * plugin for displaying a stimulus and getting a keyboard response
 *
 * documentation: docs.jspsych.org
 *
 **/


jsPsych.plugins["tower-zipping-wm"] = (function () {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('tower-zipping', 'stimulus', 'image');
  jsPsych.pluginAPI.registerPreload('tower-zipping', 'part_a_stimulus', 'image');
  jsPsych.pluginAPI.registerPreload('tower-zipping', 'part_b_stimulus', 'image');
  jsPsych.pluginAPI.registerPreload('tower-zipping', 'mask', 'image');

  plugin.info = {
    name: 'tower-zipping-wm',
    description: '',
    parameters: {
      composite_id: {
        type: jsPsych.plugins.parameterType.STRING,
        default: 'None',
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
        description: 'Bottom or left part'
      },
      part_b_stimulus: { // link to image
        type: jsPsych.plugins.parameterType.IMAGE,
        pretty_name: 'Part B stimulus',
        description: 'Top or right part'
      },
      part_type: {
        type: jsPsych.plugins.parameterType.STRING,
        default: "wide",
      },
      // stim_URL_stem: {
      //   type: jsPsych.plugins.parameterType.STRING,
      //   default: 'https://tower-4-block-unique-silhouettes-composite-silhouette-png.s3.amazonaws.com/',
      // },
      stimulus: { // link to image
        type: jsPsych.plugins.parameterType.IMAGE,
        pretty_name: 'Stimulus',
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
      mask: { // link to image
        type: jsPsych.plugins.parameterType.IMAGE,
        pretty_name: 'Mask image',
        default: null, // '../img/mask_placeholder.png',
        description: 'The image to be displayed between composite and parts'
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
        default: ['z', 'm'],
        description: 'The keys the subject is allowed to press to respond to the stimulus.'
      },
      valid_key: {
        type: jsPsych.plugins.parameterType.KEY,
        array: true,
        pretty_name: 'Valid Key',
        default: 'm',
        description: 'The key the subject should press if this is a yes trial.'
      },
      invalid_key: {
        type: jsPsych.plugins.parameterType.KEY,
        array: true,
        pretty_name: 'Invalid key',
        default: 'z',
        description: 'The key the subject should press if this is a no trial.'
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
      gapDuration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Gap duration',
        default: 0,
        description: 'How long to display a blank between composite and parts.'
      },
      chunkDuration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'parts duration',
        default: null,
        description: 'How long to display parts for.'
      },
      stimulus_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Stimulus duration',
        default: null,
        description: 'How long to hide the stimulus.'
      },
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
        description: 'If true, the image will be drawn onto a canvas element (prevents blank screen between consecutive images in some browsers).' +
          'If false, the image will be shown via an img element.'
      },
      trialNum: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'official number trial',
        default: null,
        description: 'number of actual trial.'
      },
      practice: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Is this a practice trial?',
        default: false,
      },
      fixationDuration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Length of time black cross displays for',
        default: null,
        description: 'How long to show fixation cross.'
      },
    }
  }

  plugin.trial = function (display_element, trial) {

    trial.trialStartTime = Date.now();

    var height, width;

    // display stimulus as an image element

    var html = '<div class="stims">';

    //feedback
    html += '<div id="feedback-div">'
    html += '<p class="feedback-text" id="feedback-correct" style="display: none">CORRECT ⭐️</p>';
    html += '<p class="feedback-text" id="feedback-incorrect" style="display: none">INCORRECT 😣</p>';
    html += '</div>'

    html += '<img src="' + trial.stimulus + '" id="composite-stimulus" style="display: none">';
    
    if (trial.mask) {
      html += '<img src="' + trial.mask + '" class="monochrome"  id="mask" style="display: none">';
    }

    // html += '<div id="fixation-div">'
    html += '<img class="fixation" id="fixation-cross-black" src="../img/fixation_black.png" style="display: none">';
    html += '<img class="fixation" id="fixation-cross-blue" src="../img/fixation_blue.png"  style="display: none">';
    html += '<img class="fixation" id="fixation-cross-red" src="../img/fixation_red.png" style="display: none">';
    html += '<img class="fixation" id="fixation-cross-green" src="../img/fixation_green.png" style="display: none">';
    // html += '</div>'

    // html += '<p id="fixation-cross">+<p>';

    html += '<div id="parts">'

    // part_class = trial.part_type == 'tall' ? 'part_stimulus_tall' : 'part_stimulus_wide';

    part_class = trial.part_type == 'tall' ? 'tall' : 'wide';

    // positions contingent on tall/wide 
    if (trial.part_type == 'tall') {
      html += '<img src="' + trial.part_a_stimulus + '" class="part-stimulus ' + part_class + ' monochrome" id="left-stimulus" style="display: none">';
      html += '<img src="' + trial.part_b_stimulus + '" class="part-stimulus ' + part_class + ' monochrome" id="right-stimulus" style="display: none">';
    } else {
      html += '<img src="' + trial.part_b_stimulus + '" class="part-stimulus ' + part_class + ' monochrome" id="top-stimulus" style="display: none" >';
      html += '<img src="' + trial.part_a_stimulus + '" class="part-stimulus ' + part_class + ' monochrome" id="bottom-stimulus" style="display: none">';
    };

    // html += '<p id="please-respond">Respond! "Z" for NO, "M" for YES.</p>'

    html += '</div>'
    html += '</div>'

    html += '<div id="key-reminders">'
    

    html += '<img src="../img/z_grey.png" class="key-reminder" id="z-reminder">'
    html += '<img src="../img/m_grey.png" class="key-reminder" id="m-reminder">'
    html += '<p class="response_emoji" id="valid-emoji">✅</p>' //✔
    html += '<p class="response_emoji" id="invalid-emoji">❌</p>' //✖
    html += '</div>'

    // add prompt
    if (trial.prompt !== null) {
      html += trial.prompt;
    }
    // update the page content
    display_element.innerHTML = html;

    // store response
    var response = {
      rt: null,
      key: null
    };

    var keyPresses = 0;

    let incrementKeyPresses = function(event) {
      if(event.key == 'm' || event.key == 'z'){
        keyPresses += 1;
      };
    }

    document.addEventListener('keydown', incrementKeyPresses);

    // function to end trial when it is time
    var end_trial = function () {

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // kill keyboard listeners
      if (typeof keyboardListener !== 'undefined') {
        jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      }

      // gather the data to store for the trial
      var trial_data = {
        trial_start_time: trial.trialStartTime,
        trial_finish_time: Date.now(),
        rt: response.rt,
        stimulus: trial.stimulus,
        response: response.key,
        response_correct: trial.response_correct,
        stimURL: stimURL,
        practice: trial.practice,
        // chunk_id: trial.composite_id,
        composite_id: trial.composite_id,
        // rep: trial.rep,
        // block_number: trial.blockNumber,
        composite_duration: trial.compositeDuration,
        gap_duration: trial.gapDuration,
        chunk_duration: trial.chunkDuration,
        participant_condition: trial.participantCondition,
        condition: trial.condition,
        // compatible_trial: trial.compatibleCondition == trial.participantCondition,
        validity: trial.validity,
        composite_talls_name: trial.composite_talls_name,
        actual_tall_parts: trial.actual_tall_parts,
        actual_wide_parts: trial.actual_wide_parts,
        part_type: trial.part_type,
        part_a: trial.part_a_id,
        part_b: trial.part_b_id,
        participantRotationName: trial.participantRotationName,
        participantRotation: trial.participantRotation,
        stimVersion: trial.stimVersion,
        stimVersionInd: trial.stimVersionInd,
        compatible_condition: trial.compatibleCondition,
        trial_num: trial.zippingTrialNum,
        key_presses: keyPresses,
        mask: trial.mask,
        block: trial.block,
        phase: trial.phase
      };

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

    // function to handle responses by the subject
    var after_response = function (info) {

      $('.part-stimulus').hide();
      // $('#please-respond').hide();
      // $('#please-respond').css('color', 'white');
      $('#fixation-cross-blue').hide();

      // only record the first response
      if (response.key == null) {
        response = info;
      }

      response_correct = (response.key == trial.valid_key & trial.validity == 'valid') | (response.key == trial.invalid_key & trial.validity == 'invalid');
      response_class = response_correct ? 'responded_correct' : 'responded_incorrect'

      // // after a valid response, the stimulus will have the CSS class 'responded'
      // // which can be used to provide visual feedback that a response was recorded
      // display_element.querySelector('#composite-stimulus').className += (' ' + response_class);
      if (response_correct) {
        $('#fixation-cross-black').show();
        $('#feedback-correct').show();
      } else {
        $('#fixation-cross-black').show();
        $('#feedback-incorrect').show();
      }

      // $('#composite-stimulus').show();

      trial.response_correct = response_correct;

      document.removeEventListener('keydown', incrementKeyPresses);

      if (trial.response_ends_trial) {
        setTimeout(function () {
          $('.fixation').hide();
          $('.feedback-text').hide();
          setTimeout(end_trial, 0);
        }, 1000)
      }
    };

    valid_side = trial.valid_key == 'z' ? "left" : "right";
    invalid_side = trial.invalid_key == 'z' ? "left" : "right";
    // $('#valid-emoji').css("float", valid_side);
    // $('#invalid-emoji').css("float", invalid_side);

    $('#valid-emoji').addClass(valid_side+"-emoji")
    $('#invalid-emoji').addClass(invalid_side+"-emoji")

    // hide stimulus if stimulus_duration is set
    if (trial.stimulus_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function () {
        display_element.querySelector('#composite-stimulus').hide();
      }, trial.stimulus_duration);
    }

    $('#fixation-cross-black').show();

    jsPsych.pluginAPI.setTimeout(function () {

      if (trial.compositeDuration !== null) {
        $('#composite-stimulus').show();
        $('.part-stimulus').hide();
        $('#please-respond').hide();
        $('#fixation-cross-black').hide();
      
        jsPsych.pluginAPI.setTimeout(function () {

          $('#composite-stimulus').hide();

          if (trial.mask) {
            $('#mask').show();
          } else {
            $('#fixation-cross-black').show();
          }

          jsPsych.pluginAPI.setTimeout(function () {

            $('.part-stimulus').show();
            $('#fixation-cross-black').hide();
            $('#mask').hide();
            $('#fixation-cross-blue').show();

            // start the response listener
            if (trial.choices != jsPsych.NO_KEYS) {
              var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
                callback_function: after_response,
                valid_responses: trial.choices,
                rt_method: 'performance',
                persist: false,
                allow_held_key: false,
              });
            };

            jsPsych.pluginAPI.setTimeout(function () {
              $('.part-stimulus').hide();
              // $('#please-respond').show();

            }, trial.chunkDuration);

          }, trial.gapDuration);

        }, trial.compositeDuration);
      }
    }, trial.fixationDuration); 

    // end trial if trial_duration is set
    if (trial.trial_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function () {
        end_trial();
      }, trial.trial_duration);
    } else if (trial.response_ends_trial === false) {
      console.warn("The experiment may be deadlocked. Try setting a trial duration or set response_ends_trial to true.");
    }
  };

  return plugin;
})();
