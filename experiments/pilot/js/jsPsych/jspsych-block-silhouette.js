/**
 * jspsych-block-silhouette
 * 
 * plugin for to present a silhouette and prompt participants to reconstruct it from a set of blocks
 *
 * documentation: docs.jspsych.org
 *
 * created by Will McCarthy & Judy Fan (wmccarth@ucsd.edu) Oct 2019
 * 
 **/

var score = 0; // initial score set to 0
// var numCorrect = 0; // initial num correct set to 0
// var accuracy_bonus = 0.015; // max accuracy bonus
// var max_time_bonus = 0.005; // max speed bonus
// var time_limit = 20; // time limit in seconds
// var pct_per_sec = (1/time_limit) * 100; // if time_limit==20, that means that progress bar goes down by 5% each unit time
// var decrement_per_sec = max_time_bonus/time_limit; // how much time bonus goes down per second

jsPsych.plugins["block-silhouette"] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('block-silhouette', 'button_html', 'image');

  plugin.info = {
    name: 'block-silhouette',
    description: '',
    parameters: {
      targetBlocks: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Block Collection (JSON String)',
        default: undefined,
        description: 'list of blocks comprising target structure'
      },
      targetName: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Block Collection (JSON String)',
        default: undefined,
        description: 'nickname for target structure'
      },      
      button_html: {
        type: jsPsych.plugins.parameterType.IMAGE,
        pretty_name: 'Button HTML',
        default: '<img src="%imageURL%" height="224" width="224">',
        array: true,
        description: 'The html of the button. Can create own style.'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed under the buttons.'
      },
      explore_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'build duration',
        default: null,
        description: 'How long participants will explore (or simulate) solutions.'
      },
      build_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'How long participants can spend building their final version of silhouette.'
      },
      margin_vertical: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Margin vertical',
        default: '0px',
        description: 'The vertical margin of the button.'
      },
      margin_horizontal: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Margin horizontal',
        default: '8px',
        description: 'The horizontal margin of the button.'
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: true,
        description: 'If true, then trial will end when user responds.'
      },
    }
  }

  plugin.trial = function(display_element, trial) {

    if(typeof trial.targetBlocks === 'undefined'){
      console.error('Required parameter "target" missing in block-silhouette');
    }

    // Global variables for display of trial
    // Some of these should really be read-in
    
    // Aliases for Matter functions
    var Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Constraint = Matter.Constraint,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse,
    Sleeping = Matter.Sleeping,
    Runner = Matter.Runner;

    // Parameters
    var menuHeight = 100;
    var menuWidth = 500;
    let rotateIcon;
    var floorY = 50;
    var canvasY = 500;
    var canvasX = 500;

    // Metavariables
    const dbname = 'block_construction';
    const colname = 'silhouette';
    const iterationName = 'testing';

    // Stimulus Display
    var stimCanvasX = canvasX;
    var stimCanvasY = canvasY;
    var stimX = stimCanvasX/2;
    var stimY = stimCanvasY/2;

    // p5 instances
    var p5stim;
    var p5env;

    // Scaling values
    var sF = 20; //scaling factor to change appearance of blocks
    var worldScale = 2; //scaling factor within matterjs
    var stim_scale = sF; //scale of stimulus silhouette

    // Global Variables
    var engine;
    var ground;
    var blocks = [];
    var mConstraint; // mouse constraint for moving objects. Will delete?
    var blockMenu;
    var blockKinds = [];

    // Block placement variables
    var isPlacingObject = false;
    var rotated = false;
    var selectedBlockKind = null;

    // Task variables
    var targets;
    var block_data; // data to send to mongodb about every block placement
    var trial_data; // data to send to mongodb about every finished block structure
    var newSelectedBlockKind; // init this variable so we can inspect it in the console
    var newBlock; // init this variable so we can inspect it in the console

    var blockDims = [
    [1, 2],
    [2, 1],
    [2, 2],
    [2, 4],
    [4, 2]
    ];

    // Core functions for setting up Matter JS environment and P5 Instances

    var setupEnvironment = function (env, disabledEnvironment = false) {

      // Processing JS Function, defines initial environment.
      env.setup = function() {

          // Create Experiment Canvas
          environmentCanvas = env.createCanvas(canvasX, canvasY); // creates a P5 canvas (which is a wrapper for an HTML canvas)
          environmentCanvas.parent('environment-window'); // add parent div 

          // Set up Matter Physics Engine
          engineOptions = {
              enableSleeping: true,
              velocityIterations: 24,
              positionIterations: 12
          }

          world = World.create({
              gravity: {
                  y: 2
              }
          })
          engine = Engine.create(engineOptions);
          engine.world = world;
          //engine.world.gravity.y= 2;

          // Create block kinds that will appear in environment/menu. Later on this will need to be represented in each task.

          blockDims.forEach(dims => {
              w = dims[0]
              h = dims[1]
              blockKinds.push(new BlockKind(w, h, [15, 139, 141, 100]));
          });

          //First block kind is selected
          selectedBlockKind = blockKinds[0];

          // Create Block Menu
          blockMenu = new BlockMenu(menuHeight, blockKinds);

          // Add things to the physics engine world
          ground = new Boundary(canvasX/2, (environmentCanvas.height - menuHeight)*1.15, canvasX*1.5, canvasY/3);
          //box1 = new Box(200, 100, 30, 30);

          // Runner- use instead of line above if changes to game loop needed

          runner = Matter.Runner.create({
              isFixed: true
          });
          Runner.run(runner, engine);

          // Set up interactions with physics objects
          // TO DO: stop interactions with menu bar rect
          var canvasMouse = Mouse.create(environmentCanvas.elt); //canvas.elt is the html element associated with the P5 canvas
          canvasMouse.pixelRatio = env.pixelDensity(); // Required for mouse's selected pixel to work on high-resolution displays

          var options = {
              mouse: canvasMouse // set object to mouse object in canvas
          }
          /* set up constraint between mouse and block- used to move around blocks with mouse click
          mConstraint = MouseConstraint.create(engine, options); // Create 'constraint' (like a spring) between mouse and 'body' object. 'body' is defined when mouse clicked.
          mConstraint.constraint.stiffness = 0.2; // can change properties of mouse interaction by playing with this constraint
          mConstraint.constraint.angularStiffness = 1;
          World.add(engine.world, mConstraint); // add the mouse constraint to physics engine world    
          */

      }


      env.draw = function() { // Called continuously by Processing JS 
          env.background(51);
          ground.show(env);

          // Menu
          blockMenu.show(env);
          /*
          // Rotate button
          env.noFill();
          env.stroke(200);
          env.arc(canvasX - 50, 50, 50, 50, env.TWO_PI, env.PI + 3 * env.QUARTER_PI);
          env.line(canvasX - 50 + 25, 50 - 23, canvasX - 50 + 25, 40);
          env.line(canvasX - 50 + 12, 40, canvasX - 50 + 25, 40);
          */

          blocks.forEach(b => {
              b.show(env);
          });
          /* For moving blocks with mouse drag
          if (mConstraint.body) { //if the constraint exists
              var pos = mConstraint.body.position;
              var offset = mConstraint.constraint.pointB;
              var m = mConstraint.mouse.position;
              stroke(0, 255, 0);
              line(pos.x + offset.x, pos.y + offset.y, m.x, m.y); // draw line of mouse constraint
          }*/
          if (isPlacingObject) {
              env.noCursor(); //feel like this is horribly ineffecient...
              selectedBlockKind.showGhost(env,env.mouseX, env.mouseY, rotated);
          }

      }

      env.mouseClicked = function() {
          //check to see if in env

          /* //Is clicking in top right of environment
          if (env.mouseY < 80 && env.mouseX > canvasX - 80 && isPlacingObject) {
              rotated = !rotated;
          }
          */
          
          if (!disabledEnvironment){ //environment will be disabled in some conditions
              
              // if mouse in main environment
              if (env.mouseY > 0 && (env.mouseY < canvasY - menuHeight) && (env.mouseX > 0 && env.mouseX < canvasX)) {
                  if (isPlacingObject) {
                      blocks.forEach(b => {
                          Sleeping.set(b.body, false);
                      });
                      
                      blocks.push(new Block(selectedBlockKind, env.mouseX, env.mouseY, rotated));
                      selectedBlockKind = null;
                      env.cursor();
                      isPlacingObject = false;
                      rotated = false;
                      
                      /*
                      // test out sending newBlock info to server/mongodb
                      propertyList = Object.keys(newBlock.body); // extract block properties;
                      propertyList = _.pullAll(propertyList,['parts','plugin','vertices','parent']);  // omit self-referential properties that cause max call stack exceeded error
                      blockProperties = _.pick(newBlock['body'],propertyList); // pick out all and only the block body properties in the property list

                      // custom de-borkification
                      vertices = _.map(newBlock.body.vertices, function(key,value) {return _.pick(key,['x','y'])});
                      
                      
                      block_data = {dbname: dbname,
                                      colname: colname,
                                      iterationName: iterationName,
                                      dataType: 'block',
                                      gameID: 'GAMEID_PLACEHOLDER', // TODO: generate this on server and send to client when session is created
                                      time: performance.now(), // time since session began
                                      timeAbsolute: Date.now(),  
                                      blockWidth: newBlock['w'],
                                      blockHeight: newBlock['h'],
                                      blockCenterX: newBlock['body']['position']['x'],
                                      blockCenterY: newBlock['body']['position']['y'],
                              blockVertices: vertices,
                                      blockBodyProperties: blockProperties,
                                  };            
                      console.log('block_data',block_data);
                      socket.emit('block',block_data);
                      */
                  }
              }
              else if (env.mouseY > 0 && (env.mouseY < canvasY) && (env.mouseX > 0 && env.mouseX < canvasX)){ //or if in menu then update selected blockkind
                  // is mouse clicking a block?
                  newSelectedBlockKind = blockMenu.hasClickedButton(env.mouseX, env.mouseY, selectedBlockKind);
                  if (newSelectedBlockKind) {
                      if (newSelectedBlockKind == selectedBlockKind) {
                          
                          //rotated = !rotated; // uncomment to allow rotation by re-selecting block from menu
                      } else {
                          rotated = false;
                      }
                      selectedBlockKind = newSelectedBlockKind;
                      isPlacingObject = true;
                  }
              }
          }
      }

    }

    // Setup Stimulus Env
    var setupStimulus = function (p5stim) {

      p5stim.setup = function () {
          stimulusCanvas = p5stim.createCanvas(stimCanvasX,stimCanvasX);
          stimulusCanvas.parent('stimulus-window'); // add parent div 
      };

      p5stim.draw = function () {
          p5stim.background(200);
          var testStim = trial.targetBlocks;
          showStimulus(p5stim,testStim)

      };
    };


    var simulate = function () {
      p5stim = new p5((env) => {
        setupStimulus(env)
      }, 'stimulus-canvas');
      p5env = new p5((env) => {
        setupEnvironment(env, disabledEnvironment = true)
      }, 'environment-canvas');
      hideEnvButtons();
    }

    var explore = function () {
      p5stim = new p5((env) => {
        setupStimulus(env)
      }, 'stimulus-canvas');
      p5env = new p5((env) => {
        setupEnvironment(env, disabledEnvironment = false)
      }, 'environment-canvas');
      hideDoneButton();
    }

    var buildStage = function () {
      p5stim = new p5((env) => {
        setupStimulus(env)
      }, 'stimulus-canvas');
      p5env = new p5((env) => {
        setupEnvironment(env, disabledEnvironment = false)
      }, 'environment-canvas');
    }

    var resetEnv = function () {
      // remove environment
      p5env.remove();

      // Update variables
      blocks = [];
      blockKinds = [];
      isPlacingObject = false;
      rotated = false;
      selectedBlockKind = null;
      // setup new environment   
    }

    var resetStimWindow = function () {
      // remove environment
      p5stim.remove();

    }

    function hideEnvButtons() {
      window.onload = function () {
        var envButtons = document.getElementById("env-buttons");
        envButtons.style.display = "none";
      };

    }

    function hideDoneButton() {
      window.onload = function () {
        var envButtons = document.getElementById("done");
        envButtons.style.display = "none";
      };

    }

    function revealEnvButtons() {
      window.onload = function () {
        var envButtons = document.getElementById("env-buttons");
        envButtons.style.display = "inline-block";
      };
    }




    // wrapper function to show everything, call this when you've waited what you
    // reckon is long enough for the data to come back from the db
    function show_display() {

      // //display buttons
      // var buttons = [];
      // if (Array.isArray(trial.button_html)) {
      //   if (trial.button_html.length == trial.choices.length) {
      //     buttons = trial.button_html;
      //   } else {
      //     console.error('Error in block-silhouette plugin. The length of the button_html array does not equal the length of the choices array');
      //   }
      // } else {
      //   for (var i = 0; i < trial.choices.length; i++) {
      //     buttons.push(trial.button_html);
      //   }
      // }


      var html = ''

      html += '<div class="container pt-5" id="experiment">'
      html += '<div class="row">'
      html += '<div class="col-md" id="stimulus-window">'
      html += '</div>'
      html += '<div class="col-md" id="environment-window">'
      html += '</div>'
      html += '</div>'
      html += '<div class="row pt-2" id="experiment-button-col">'
      html += '<div class="col-auto ml-auto button-col" id="env-buttons">'
      html += '<button type="button" class="btn btn-success" id="done" value="done" onclick="donePressed();">Done</button>'
      html += '<button type="button" class="btn btn-danger" id="reset" value="reset" onclick="resetPressed();">Reset</button>'
      html += '</div>'
      html += '</div>'
      html += '<div class="row pt-2" id="trial-info">'
      html += '<div class="col align-text-center" id="trial-number">'
      html += '<p>Trial 1 of 1</p>'
      html += '</div>'
      html += '</div>'
      html += '</div>'
      

      // //show prompt if there is one
      // if (trial.prompt !== null) {
      //   var html = '<div id="prompt">' +trial.prompt + '</div>';
      // }

      // html += '<div class="progress"><div id="progress-bar"></div></div>'

      // // display sketch (image)
      // html += '<div style="margin-top:20px"><img id="jspsych-block-silhouette-sketch" src="'+ trial.sketch_url +'"></img></div>';

      // html += '<div id="jspsych-block-silhouette-btngroup">';

      // // embed images inside the response button divs
      // for (var i = 0; i < trial.choices.length; i++) {
      //   var str = buttons[i].replace(/%imageURL%/g, trial.choices[i]);
      //   var object_id = trial.choices[i].split('/').slice(-1)[0].split('.')[0]; // splice to extract only shapenetID and target_status
      //   html += '<div class="jspsych-block-silhouette-button" style="display: inline-block; margin : 0" id="jspsych-block-silhouette-button-' + i +'" data-choice="'+object_id+'">'+str+'</div>'; //'+trial.margin_horizontal+' '+trial.margin_vertical+'"
      // }

      // html += '</div>';
      
      // // display score earned so far
      // html += '<div id="score"> <p2> bonus earned: ' + parseFloat(score).toFixed(3) + '</p2></div>'
      // html += '<div id="trial-counter"> <p2> trial ' + (parseInt(trial.trialNum)+parseInt(1)).toString() + ' of ' + trial.num_trials + '</p2></div>'

      // introduce occluder to make the inter-trial transitions less jarring
      //html += '<div id="occluder"> </div>'

      // // display helpful info during debugging
      // if (trial.dev_mode==true) {
      //   html += '<div id="repetition"> <p> repetition: ' + trial.repetition + '</p></div>'
      //   html += '<div id="condition"> <p> condition: ' + trial.condition + '</p></div>'
      // }

      // actually assign html to display_element.innerHTML
      display_element.innerHTML = html;
      
      buildStage();

      // // add click event listener to the image response buttons
      // for (var i = 0; i < trial.choices.length; i++) {
      //   $('#jspsych-block-silhouette-button-' + i).on('click', function(e) {
      //     var choice = e.currentTarget.getAttribute('data-choice'); // don't use dataset for jsdom compatibility
      //     after_response(choice);
      //   });      
      // }      

    }

    // call show_display now, which includes a massive occluder that covers everything up
    show_display();

    // wait for a little bit, then remove the occluder, which should be safely after everything has been rendered
    jsPsych.pluginAPI.setTimeout(function() {$('#occluder').hide();},1000);

    // start timing
    var start_time = Date.now();
    var progressBar = $('#progress-bar');
    var time_bonus = 0;
    
    // progressBar.show();
    // var widthPct = 100 // starts at 105% b/c of the 1000ms delay above before occluder disappears
    // var seconds_passed = 0;
    // var interval = setInterval(function(){
    //   seconds_passed += 1;
    //   widthPct -= pct_per_sec; // goes down by 5% each second
    //   progressBar.animate({ width: widthPct + '%' }, 1000, "linear");
    //   if (widthPct <= 0) {
    //     clearInterval(interval);
    //   }
    // }, 1000);

    // store response
    var response = {
      rt: null,
      button: null,
      time_bonus: null
    };

    // function to handle responses by the subject
    function after_response(choice) {
      // console.log('after response function called');
      
      // // End timer
      // clearInterval(interval);
      // progressBar.stop();
      
      // measure rt
      var end_time = Date.now();
      var rt = end_time - start_time;
      response.rt = rt;

      // // after a valid response, the sketch will have the CSS class 'responded'
      // // which can be used to provide visual feedback that a response was recorded
      // display_element.querySelector('#jspsych-block-silhouette-sketch').className += ' responded';

      // // disable all the buttons after a response
      // for (var i = 0; i < trial.choices.length; i++) {
      //   $('#jspsych-block-silhouette-button-' + i).off('click');
      // }      

      if (trial.response_ends_trial) {
        end_trial();  
      }
    };

    // function to end trial when it is time
    function end_trial() {

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // get info from mturk
      var turkInfo = jsPsych.turk.turkInfo();

      // // prettify choices list
      // var prettyChoices = new Array;
      // _.forEach(trial.choices, function(x) {
      //   prettyChoices.push(x.split('/').slice(-1)[0].split('.')[0]);
      // });

      // // check if response matches target, i.e., whether response is correct
      // var trial_correct;
      // if (response.button == trial.target.shapenetid) {
      //   trial_correct = 1;
      //   increment = accuracy_bonus + parseFloat(time_bonus);
      //   score+= parseFloat(increment); // increment accuracy bonus and time bonus
      //   numCorrect += 1; // increment num correct by one
      // } else {
      //   trial_correct = 0;
      // }

      // gather the data to store for the trial
      if (trial.dev_mode == true) {
        console.log(trial);
      }
      var trial_data = _.extend(_.omit(trial, 'on_finish'), {
          dbname: 'block_construction',
          colname: 'silhouette',
          // rt: response.rt,
          // correct: trial_correct,
          // numCorrectSoFar: numCorrect,
          // original_correct: trial.outcome,
          // stim_mongo_id: trial._id,
          // response: response.button,
          // score: score,
          // workerId: turkInfo.workerId,
          // hitID: turkInfo.hitId,
          // aID: turkInfo.assignmentId,
          timestamp: Date.now()
      });

      if (trial.dev_mode == true) {
        console.log('trial data: ', trial_data);
        console.log('correct?  ', trial_correct);
      }

    // // get location index of target
    // target_index = _.indexOf(prettyChoices, trial.target.shapenetid);
    // response_index = _.indexOf(prettyChoices, response.button);
    // if (trial.dev_mode == true) {
    //   console.log('target_index: ', target_index); 
    //   console.log('response_index: ', response_index); 
    // }

    // // show feedback
    // if (trial_correct==true) {
    //  // show feedback by drawing GREEN box around TARGET if selected CORRECTLY    
    //   display_element.querySelector('#jspsych-block-silhouette-button-' + target_index).style.border = "8px solid #66B03B"
    //   // also bold/enlarge the score in bottom left corner 
    //   display_element.querySelector('#score p2').innerHTML = 'bonus earned: ' + parseFloat(score).toFixed(3);
    //   display_element.querySelector('#score p2').style.fontWeight = 'bold';
    // } else {
    //  // draw RED box around INCORRECT response and BLACK box around TARGET
    //  display_element.querySelector('#jspsych-block-silhouette-button-' + target_index).style.border = "8px solid #282828"      
    //  display_element.querySelector('#jspsych-block-silhouette-button-' + response_index).style.border = "8px solid #D02B16"      
    // }

    // // wait to screen and moving onto next trial until you show feedback
    // jsPsych.pluginAPI.setTimeout(function() {
    //                   clear_display_move_on(trial_data);},2000);      

    };

    // 
    function clear_display_move_on(trial_data) {
      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);

    };

    // hide image if timing is set
    if (trial.explore_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        display_element.querySelector('#jspsych-block-silhouette-sketch').style.visibility = 'hidden';
      }, trial.sketch_duration);
    }

    // end trial if time limit is set
    if (trial.build_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.trial_duration);
    }

  };

  return plugin;
})();
