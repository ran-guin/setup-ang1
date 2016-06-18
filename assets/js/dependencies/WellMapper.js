function wellMapper() {

    // Function: 
    //
    // ***********
    // colourMap 
    // ***********
    //
    // This generates a default colour map of NxN matrices for visualization purposes
    // (designed to illustrate mapping of sources on an 8x12 well plate using various shades of spectrum colours)
    //
    //
    //  Options: 
    //      N : Number of colours 
    //      shades : Number of shades
    //          (resultant total number of colours will be N x shades)
    //
    //  Returns attributes: 
    //   Map : hash (kys = colours;  values = array of rgb values corresponding to gradually lighter shades of colour) 
    //   rgbList : simple ordered array of rgb values for target  ( to be associated with input array of source ids)
    //   colours : simple array of colours used 
    //
    //
    // *************
    // distribute
    // *************
    //
    //  Options: 
    //      split = N           : indicates that each source record is to be assigned to N target positions
    //      fill_by = 'row'     : indicates whether ordering of sample distribution occurs by row or by column
    //      mode = 'parallel'   : indicates whether distribution is applied in 'parallel' or 'serially'
    //      batch = M       : indicates that M wells are to be handled together (as with multi-channel pipette)
    //                          (this is only applicable when split > 1 and mode = 'parallel')
    //
    //  Returns attributes: 
    //   targetMap : hash (kys = colours;  values = array of rgb values corresponding to gradually lighter shades of colour) 
    //
    // Use for testing .. but Speed up in production by only including static map loading ... 

    this.colours = [];
    this.rgbList = [];
    this.Map = {};

    this.colourMap = function (length, options) {

        if (!options) { options = {} }
        N = 8;          // Number of colours
        shades = 12;    // Number of shades

        var shade_gap = 1;
        if (length <=8 ) { shades = 1 }

        var list = [];
        
        var colourList = ['red','purple','blue','teal','green','yellow','orange','grey'];
        var hex = ['00','1a','33','4d','66','80','99','b3','cc','e6','ff'];  // domain of rgb values to use 

        // define array of starting points for rgb values (eg N -> hex[N] for each colour)
        var reds   = [7, 5, 0, 0, 0, 5, 6, 3, 1];
        var greens = [0, 0, 0, 5, 5, 5, 4, 2, 1];
        var blues  = [0, 5, 5, 5, 0, 0, 1, 1, 1];

        var Map = {};    

        var colours = [];
        var rgbList = [];

        var maxIndex = hex.length - 1;

        for (var c=0; c<N; c++) {
            colours.push(colourList[c]);
            Map[colours[c]] = [];

            var red = reds[c];
            var green = greens[c];
            var blue = blues[c];

            for (var i=0; i<shades; i=i+shade_gap) {

                var rgb = hex[red] + hex[green] + hex[blue];
                if (red >= maxIndex) { 

                    if (blue < red) { blue++ }
                    if (green < red) { green++ }

                    red = maxIndex;
                    
                    if (blue > maxIndex) { blue = maxIndex }
                    if (green > maxIndex) { green = maxIndex }
                }
                else if (green >= maxIndex) { 

                    if (blue < green) { blue++ }
                    red++;

                    green = maxIndex;
                    
                    if (blue > maxIndex) { blue = maxIndex }
                }          
                else if (blue >= maxIndex) { 
                    blue = maxIndex;
                    green++;
                    red++;
                }    
                else if (red == green && red == blue ) {
                    red++;
                    green++;
                    blue++;
                }       
                else if (red >= green && red >= blue) {
                    if (green == red) { green++ }
                    if (blue == red) { blue++ }
                    red++;
                }
                else if (green >= red && green >=blue) {
                    if (red == green) { red++ }
                    if (blue == green) { blue++ }
                    green++
                }
                else if (blue >= red && blue >= green) {
                    if (red == blue) { red++ }
                    if (green == blue) { green++ }
                    blue++
                }       


                Map[colours[c]].push(rgb);
                rgbList.push(rgb);

            }
        }

        var rows = ['A','B','C','D','E','F','G','H'];
        var columns = 12; 
        var CMap = {};
        for (var ri=0; ri < rows.length; ri++) {
            for (var ci=1; ci <= columns; ci++) {
                CMap[rows[ri] + ci.toString()] = Map[colours[ri]][ci-1];
            }
        }

        this.CMap = CMap;
        console.log("Initial CMAP: " + JSON.stringify(CMap));

        this.colours = colours;
        this.rgbList = rgbList;

        this.Map = Map;

        return { Map : Map, list : rgbList, colours : colours, colourMap: CMap }
    },

    this.staticMap = function() {

        this.colours = ['red','purple','blue','teal','green','yellow','orange','grey'];

        this.ColourMap = {"A1":"b30000","A2":"cc0000","A3":"e60000","A4":"ff0000","A5":"ff1a1a","A6":"ff3333","A7":"ff4d4d","A8":"ff6666","A9":"ff8080","A10":"ff9999","A11":"ffb3b3","A12":"ffcccc","B1":"800080","B2":"990099","B3":"b300b3","B4":"cc00cc","B5":"e600e6","B6":"ff00ff","B7":"ff1aff","B8":"ff33ff","B9":"ff4dff","B10":"ff66ff","B11":"ff80ff","B12":"ff99ff","C1":"000080","C2":"000099","C3":"0000b3","C4":"0000cc","C5":"0000e6","C6":"0000ff","C7":"1a1aff","C8":"3333ff","C9":"4d4dff","C10":"6666ff","C11":"8080ff","C12":"9999ff","D1":"008080","D2":"009999","D3":"00b3b3","D4":"00cccc","D5":"00e6e6","D6":"00ffff","D7":"1affff","D8":"33ffff","D9":"4dffff","D10":"66ffff","D11":"80ffff","D12":"99ffff","E1":"008000","E2":"009900","E3":"00b300","E4":"00cc00","E5":"00e600","E6":"00ff00","E7":"1aff1a","E8":"33ff33","E9":"4dff4d","E10":"66ff66","E11":"80ff80","E12":"99ff99","F1":"808000","F2":"999900","F3":"b3b300","F4":"cccc00","F5":"e6e600","F6":"ffff00","F7":"ffff1a","F8":"ffff33","F9":"ffff4d","F10":"ffff66","F11":"ffff80","F12":"ffff99","G1":"99661a","G2":"b3661a","G3":"cc661a","G4":"e6661a","G5":"ff661a","G6":"ff8033","G7":"ff994d","G8":"ffb366","G9":"ffcc80","G10":"ffe699","G11":"ffffb3","G12":"ffffcc","H1":"4d331a","H2":"66331a","H3":"80331a","H4":"99331a","H5":"b3331a","H6":"cc331a","H7":"e6331a","H8":"ff331a","H9":"ff4d33","H10":"ff664d","H11":"ff8066","H12":"ff9980"};

        this.rgbList = ["b30000","cc0000","e60000","ff0000","ff1a1a","ff3333","ff4d4d","ff6666","ff8080","ff9999","ffb3b3","ffcccc","800080","990099","b300b3","cc00cc","e600e6","ff00ff","ff1aff","ff33ff","ff4dff","ff66ff","ff80ff","ff99ff","000080","000099","0000b3","0000cc","0000e6","0000ff","1a1aff","3333ff","4d4dff","6666ff","8080ff","9999ff","008080","009999","00b3b3","00cccc","00e6e6","00ffff","1affff","33ffff","4dffff","66ffff","80ffff","99ffff","008000","009900","00b300","00cc00","00e600","00ff00","1aff1a","33ff33","4dff4d","66ff66","80ff80","99ff99","808000","999900","b3b300","cccc00","e6e600","ffff00","ffff1a","ffff33","ffff4d","ffff66","ffff80","ffff99","99661a","b3661a","cc661a","e6661a","ff661a","ff8033","ff994d","ffb366","ffcc80","ffe699","ffffb3","ffffcc","4d331a","66331a","80331a","99331a","b3331a","cc331a","e6331a","ff331a","ff4d33","ff664d","ff8066","ff9980"];

    }

    this.col = function () {

        return this.colours;
    },

    this.from = function ( sources ) {
        // test data //
        var rows = ['A', 'B','C', 'D', 'E', 'F', 'G','H'];
        var cols = [1,2,3,4,5,6, 7, 8, 9, 10, 11, 12];
       

        this.source_cols = cols;
        this.source_rows = rows;

        var options = {
            rows : rows,
            cols : cols,
        }

    },

    this.next_available = function (batch_index) {

        if (! this.target_count[batch_index]) { this.target_count[batch_index] = 0 }
        
        var x = 'A';
        var y = 1;
        if (this.available && this.available[batch_index]) {
            var next = this.available[batch_index][this.target_count[batch_index]] || 'A1';
            x = next;
            if (x) { y = next.replace(x,'') }
        }
        else { console.log('next box not defined');  }

       if (this.available && this.available[batch_index] && this.available[batch_index].length > this.target_count[batch_index]) {
            this.target_count[batch_index]++;
        }
        else {
            batch_index++;
            this.target_count[batch_index] = 1;
        }
        this.total_target_count++;       

        x = x.toUpperCase();
        return { x: x, y: y, batch_index: batch_index};
    },

    this.initialize = function (sources, Target, Options ) {
        //var sources = [{ id: 1, type: 'blood', position: 'A1'}, { id : 2, type : 'blood', position : 'A2'}];
        
        //var rows = Target.rows || this.source_rows;  // unnecessary..
        //var cols = Target.cols || this.source_cols;

        if (!Options) { Options = {} }

        this.fill_by = Options.fillBy || 'Row';
        this.pack_wells    = Options.pack_wells || Options.pack || 0;
        this.preserve_position = ! this.pack_wells; // unnecessary... 
        this.split_mode = Options.split_mode || 'parallel';
        this.preserve_batch = this.batch;
        this.target_size = Options.target_size;
        this.sources = sources;
        this.source_count = sources.length;

        this.x_min = Options.Min_Row || 'A';
        this.y_min = Options.Min_Col || 1;

        this.Container_format = Target.Container_format;
        this.Sample_type = Target.Sample_type

        this.splitX = Options.split || Options.splitX || 1;

        this.available = Options.available;
        
        this.transfer_type = Options.transfer_type;

        this.source_count = sources.length;
 
        this.target_count = {};

        var boxes_required = 0;
        if (Options.available) {
            if (Options.available.constructor === Object) {
                // specifically supplied for each target box
                this.available = Options.available;
            }
            else {
                var boxes_required = Math.ceil( this.source_count * this.splitX / Options.available.length );   // test only
                
                console.log("Require " + boxes_required + " boxes");
                var Available = [];
                for (var i=0; i<boxes_required; i++) {
                    Available.push(Options.available);
                }
                this.available = Available;
            }
        }
        else {
            this.x_max = Options.Max_Row || 'A';
            this.y_max = Options.Max_Col || 1;
        }
        
        this.boxes_required = boxes_required;

        this.Options = {
            split : this.splitX,
            pack  : this.pack_wells,
            split_mode : this.split_mode,
            sources : this.source_count,
            targets : this.source_count * this.splitX,
            target_boxes: this.boxes_required,
            target_size: this.target_size,
            fill_by    : this.fill_by,
            transfer_type : this.transfer_type,
        };

        console.log("Initialized:\nsplit = " + this.splitX + "\nfillBy = " + this.fill_by + "\npack_wells = " + this.pack_wells + "\nmode = " + this.split_mode + "\ntarget_size = " + this.target_size + "\n");
        console.log("Available" +JSON.stringify(this.available)); 

        this.target_boxes = Options.target_boxes || [];       // target box ids 
        //this.available = Options.available || {};   // hash of available wells keyed on target box ids
    }

    this.distribute = function ( sources, Target, Options, callback) {
//
//        Input:
//        
//        sources: array of hashes - eg [ { id: 101, position: 'A1'}, { id: 102, position: 'A2'}]
//        target : hash of specs - eg { Max_Row : 'A', Max_Col: 1 }  
//        options: hash of options - eg { 
//                  split : 2, 
//                    mode: serial, 
//                    pack: true, 
//                    pack_wells: 8, 
//                    qty: [array or static value], 
//                    fill_by: column, 
//                    target_boxes: [4]
//                }
//

        var Transfers = [];
        var warnings = [];

        var targetMap = [];
        if (! Target) { Target = {} };
        if (! sources) { 
            console.log("Missing Source or Target information");
            callback("Missing Source or Target information");
            //return {}
        }
        if (!Options) { Options = {} }

        console.log("run distribute function... ");
        // console.log(sources.length + " Sources: " + JSON.stringify(sources));
        console.log("Target: " + JSON.stringify(Target));
        console.log("Options: " + JSON.stringify(Options));

        this.initialize(sources, Target, Options);

        var batch_index = 0;

        var next = this.next_available(batch_index);
        x = next.x;
        y = next.y;
        
        // var Xfer = [];

       //var Colour = [];
        //var SourceColours = {};
        // var TargetColours = {};

         var target_position = this.x_min + this.y_min.toString();

        // Transfer[batch_index] = {};
        // Transfer[batch_index][target_position] = sources[0];

        //TargetColours[batch_index] = {};

        // Colour[batch_index][target_position];

        var repeat_set = 1;
        var repeat_wells = 1;

        var List = {};
        var Static = {};

        var options = Object.keys(Target);

        for (var i=0; i<options.length; i++) {
            console.log(i);
            var opt = Target[options[i]];

            if (opt && opt.constructor === String && opt.match(/,/) ){
                opt = opt.split(/\s*,\s*/);
            }

            console.log(options[i] + ":" + opt);
            if (opt && opt.constructor === Array) {
                List[options[i]] = [];
                console.log("options length = " + opt.length);
                if (this.splitX > 1) {
                    if (this.split_mode === 'serial') {
                        for (k=0; k<sources.length; k++) {
                            for (j=0; j<this.splitX; j++) {
                                List[options[i]].push(opt[j]);
                            }
                        }
                    }
                    else {
                        for (j=0; j<this.splitX; j++) {
                            for (k=0; k<sources.length; k++) {
                                List[options[i]].push(opt[j]);
                            }
                        }
                    }
                }
                else if (opt.length > 1) {
                    var repeat = sources.length / opt.length;
                    console.log("repeat x " + repeat);
                    if (this.split_mode === 'serial') {
                        for (j=0; j<opt.length;j++) {
                            for (k=0; k<repeat; k++) {
                                List[options[i]].push(opt[j]);
                            }
                        }                        
                    }
                    else {                // (this.split_mode === 'serial') {
                        for (k=0; k<repeat; k++) {
                            for (j=0; j<opt.length;j++) {
                                List[options[i]].push(opt[j]);
                            }
                        }                        
                    }                    
                }
                else {
                    Static[options[i]] = opt[0];
                    console.log("only one value in array - set to static value: " + opt[0]);
                }

                console.log("\n* Split " + options[i] + " to: " + List[options[i]] );
            }
            else {
                // single value only 
                Static[options[i]] = opt;
                console.log("\n* Static " + options[i] + ' = ' + JSON.stringify(opt));
            }
        }

        console.log("Lists");
        var lists = Object.keys(List);
        var statics = Object.keys(Static);

        var pack_wells = this.pack_wells;
        var splitX     = this.splitX;

        if (this.split_mode === 'serial') { 
            repeat_wells = this.splitX || 1;
        }
        else {
            pack_wells = sources.length; 
            repeat_set = this.splitX || 1;
        }


        var batches = [];
        for (var i=0; i<sources.length; ) {
            var batch = [];
            for (j=0; j<pack_wells && i<sources.length; j++) {
                batch.push(i);
                i++;
            }
            batches.push(batch);
        }
        var target = 0;

        console.log("\n*** BATCH PROCESSING ");
        console.log(JSON.stringify(batches));

        console.log("AVAILABLE: ");
        console.log(JSON.stringify(this.available));

        console.log(this.split_mode + " looping " + batches.length + "x" 
            + splitX + ' x ' +
            + batches[0].length + 'x'
            + repeat_wells);


        var SourceMap = {};        
        var Transfer = [];
        var TransferMap = [];
 
        var count = 0;
        for (j=0; j<batches.length; j++) {
            var batch = batches[j];
            for (var h=0; h<splitX; h++) { 
                   
                for (l=0; l<batch.length; l++, count++) {
                    var i = batch[l];
                    
                    if (! sources[i].position) { 
                        warnings.push("No Source Position Information for Sample " + sources[i].id);
                        sources[i].position = ''
                    }

                    // SourceColours[sources[i].position.toUpperCase()] = this.rgbList[i];

                    if (sources[i].box_id) {
                        if (! SourceMap[sources[i].box_id]) { SourceMap[sources[i].box_id] = {} } 

                        SourceMap[sources[i].box_id][sources[i].position.toUpperCase()] = {
                            colour_code : this.rgbList[i],
                            source_id   : sources[i].id,
                            box_size    : sources[i].box_size,
                        };
                    }
                    else {
                        warnings.push("Box information missing for sample " + i);
                    }

                    var target_position;

                    if (this.fill_by === 'row' || this.fill_by === 'column') { 
                        target_position = x + y.toString();
                        target_position = target_position.toUpperCase();
                    }
                    else {
                        var source_index = batches[j][batch]
                        target_position = sources[i].position.toUpperCase();

                        if (this.split_mode == 'serial') {
                            batch_index = j;
                        }
                        else {
                            batch_index = h;
                        }
                    }

                    console.log(i + ' box #' + batch_index + '-' + target_position + ' = container #' + sources[i].id + ' from ' + sources[i].position);

                    if (! TransferMap[batch_index]) { TransferMap[batch_index] = {} }
                    // if (! TargetColours[batch_index]) { TargetColours[batch_index] = {} }
  
                    TransferMap[batch_index][target_position] = sources[i];
                    // TargetColours[batch_index][target_position] = this.rgbList[i];

                    console.log("Transfer : " + JSON.stringify(TransferMap[batch_index][target_position]) );
                    // console.log("Colour : " + JSON.stringify(TargetColours[batch_index][target_position]) );
                    //rearray.push([sources[i], Container.position(sources[i]), targets[batch_index], target_position]);

                    var XferData = { 
                        batch: batch_index,
                        source_id: sources[i].id,
                        source_position: sources[i].position,
                        target_position: target_position,
                    };


                    var MapData = {
                        // for visualization only 
                        source_id: sources[i].id,
                        source_position: sources[i].position,
                        target_position: target_position,
                        colour_code: '#' + this.rgbList[i],
                        target_index: count,
                    };

                    var TargetData = {
                        batch: batch_index,
                        source_id: sources[i].id,
                        //source_position: sources[i].position,
                        //target_position: target_position,
                        //colour_code: '#' + this.rgbList[i],
                        // target_index: count,
                    };

                    // Add Static Values (single values entered)
                    for (var stat=0; stat<statics.length; stat++) {
                        var opt = statics[stat];
                        // XferData[opt] = Static[opt];
                        TargetData[opt] = Static[opt];
                    }

                    // Add multiplexed values (comma-delimited list entered)
                    for (var list_index=0; list_index<lists.length; list_index++) {
                        var opt = lists[list_index];
                         // XferData[opt] = List[opt][target];
                         TargetData[opt] = List[opt][target];
                    }

                    TransferMap[batch_index][target_position] = MapData;

                    // Xfer.push(XferData);
                    Transfer.push(TargetData);

                    // next...
                    if (this.fill_by === 'row' || this.fill_by === 'column') {
                        var next = this.next_available(batch_index);
                        x = next.x;
                        y = next.y;
                        batch_index = next.batch_index;                                
                    }
                    else {
                        // Does not use x and y for positioning above... 
                    }

                    target++;
                }
            }
        } 

        //this.Transfer = Transfer;
        //this.TMap = TransferMap;
        //this.TransferMap = TargetColours;
        //this.Xfer = Xfer;

        console.log("completed distribution... ");
        var data = {
            Transfer: Transfer,         // [ { batch: 0, source_id: 123, qty ; 20, qty_units: 'ml' ...}, { }, ...]
            TransferMap: TransferMap,   // helps with visualization purposes
            Options : this.Options,
            // TargetColours: TargetColours,
            // Xfer : Xfer,
            SourceMap: SourceMap,
            warnings: warnings,
        };

        if (callback && callback.constructor === 'function') {
            console.log("callback detected");
            return callback(null, data);
        }
        else {
            console.log(" no call back .. normal returnval ")
            return data;            
        }
    }

    this.split_list = function split_list (field, input, options) {
        
        if (!options) { options = {} }
 //
 //       split = this.splitX; // $scope['Split' + $scope.stepNumber] || 1;
 //       N = $scope.N;
 //       prefix = $scope.Prefix(field);
 //       split_mode = this.split_mode;  //$scope['split_mode' + $scope.stepNumber]

        var prefix   = options.prefix;                    // optional prefix characters for interpretting/separating multiple barcodes
        var N        = options.count  || 1;
        var split    = options.split || this.splitX || 1;                  // splitting each source into N targets
        var split_mode = options.split_mode || this.split_mode || 'parallel';  // serial=A,A,B,B,C,C; parallel = A,B,C,A,B,C
    
        var errors = [];
        var disable = false;
        var list = '';
        var array = [];
        var isList = false;

//
//    $scope[field + _split] = input
//
        var Nx = N * split;

        if (input && input.match(/,/)) {
            
            //$scope[field + '_split'] = input;

            //var prefix = $scope.Prefix(field);
            
            var separator;
            if (prefix) { 
                separator = prefix;
            }
            else {
                separator = ',';
            }
            console.log("Split " + field + ' ON ' + separator + ' : ' + prefix);

            var splitExpr = new RegExp('\\s*' + separator + '\\s*', 'ig');

            var input_array = input.split(splitExpr);
  
            //var split = $scope['Split' + $scope.stepNumber];          
            if (split > 1 ) {
                console.log("Require split to be " + split);
                if (input_array.length > 1 && input_array.length != split) {
                    //$scope.errMsg = "Multiple value count must match split count";
                    //$scope['form' + $scope.stepNumber].$invalid = true;
                    errors.push("Multiple value count must match split count");
                    disable = true;
                    console.log("FAIL");
                }
            }


            if (prefix && (input_array.length > 1) && (input_array[0] == '') ) { input_array.shift() }  // remove first element 

            console.log('test: ' + JSON.stringify(input_array) );

            var entered = input_array.length;

            var factor = Nx / entered;
            var round = Math.round(factor);
            
            console.log("Array: " + JSON.stringify(input_array) + " x " + factor);
     
            if (factor == round) {
                 //$scope[field+'_errors'] = '';
                 //$scope.formDisabled  = false;
                errors = [];
                disable = false;
            }
            else {
                errors.push("# of entered values must be factor of " + N);
                disable = true;
                //$scope[field+'_errors'] = "# of entered values must be factor of " + $scope.N;
                //$scope.formDisabled  = true;
           }

            var array = [];
            var offset = 0;
            var index = 0;


            if ( split_mode.match(/Serial/) ) {
                for (var i=0; i<Nx; i++) {
                    array[i] = input_array[index];
                    offset++;
                    if (offset >= round) {
                        offset=0;
                        index++;
                    }
                }
            }
            else {
                for (var i=0; i<Nx; i++) {
                    array[i] = input_array[index];

                    index++;
                    if (index >= entered) {
                        index=0;
                    }
 
                }                
            }
     
            //$scope[field + '_split'] = array.join(','); 
            list = array.join(',');

            console.log(field + ' split to: ' + JSON.stringify(list));
            
            //$scope.SplitFields[field] = array;
 
            if (entered > 1) { 
                //$scope['ListTracking' + $scope.stepNumber] = true;
                isList = true;
            }  
            else {
                isList = false;
            }
   
            return array;
            
            
        }
        else { console.log('not multiple values...') }

        console.log(input + '->' + list);
        //console.log("\n** SPLIT: " + $scope[field] + ' OR ' + $scope[field + '_split']);   
    }

    this.testMap = function (sources, Target, Options) {
        // used simply to generate easily testable strings showing sample distributions
        // this is used by unit tests below to test ordered list of ids, source positions, target_positions

        var results = this.distribute(sources, Target, Options);
        
        var id_list = [];
        var position_list = [];
        var targets = [];

        // console.log('Xfer: ' + JSON.stringify(this.Xfer));

       for (var i=0; i<this.Transfer.length; i++) {
            var transfer = this.Transfer[i];
            id_list.push(transfer.source_id);
            position_list.push(transfer.source_position);
            targets.push(transfer.batch + '-' + transfer.target_position);
        }


        return [ id_list.join(','), position_list.join(','), targets.join(',') ];
    }
}

/* Unit Tests */

var assert = require('chai').assert;

describe('wellMapper()', function() {
 
    describe('* initialization', function () {
        var map = new wellMapper();
        map.initialize( { Min_Col : 3, Max_Row : 'D', Max_Col : 7 } );

        it('simple initialization', function () {
            assert.equal('A', map.x_min);
            assert.equal('D', map.x_max);
            assert.equal(3,   map.y_min);
            assert.equal(7,   map.y_max);

        });
    });

    // quite extensive set of tests to ensure distribution of wells follows expectations
    describe('* distribute', function () {

        var Target = { Max_Row : 'B',  Max_Col : 2 };
    
        var ids = [1,2,3,4,5,6]
        var positions = ['A1','A2','A3','B1','B2','B3'];

        var sources = [];
        for (var i=0; i<6; i++) {
            sources.push( { id: ids[i], position: positions[i] });
        }

        describe('= default', function () {

            var map = new wellMapper();
            var test1 = map.testMap(sources, { Max_Row : 'B', Max_Col : 2 }, { pack: 1});

            // target options:  transfer_qty, transfer_qty_units, format: N, sample_type: N, split: N, pack_wells: N, split_mode: serial/parallel,  

            it('simple 1 to 1 default transfer', function () {
              assert.equal('1,2,3,4,5,6', test1[0]);
              assert.equal('A1,A2,A3,B1,B2,B3', test1[1]);
              assert.equal('0-A1,0-A2,0-B1,0-B2,1-A1,1-A2', test1[2])
            });
        });

       describe('= parallel split', function () {

            var map = new wellMapper();
            var test1 = map.testMap(sources, {Max_Row : 'B', Max_Col : 2 }, { pack: 1, split: 2});

            // target options:  transfer_qty, transfer_qty_units, format: N, sample_type: N, split: N, pack_wells: N, split_mode: serial/parallel,  

            it('parallel split: A,B,C.. A,B,C', function () {
              assert.equal('1,2,3,4,5,6,1,2,3,4,5,6', test1[0]);
              assert.equal('A1,A2,A3,B1,B2,B3,A1,A2,A3,B1,B2,B3', test1[1]);
              assert.equal('0-A1,0-A2,0-B1,0-B2,1-A1,1-A2,1-B1,1-B2,2-A1,2-A2,2-B1,2-B2', test1[2])
            });
        });

        describe('= serial split', function () {

            var map = new wellMapper();
            var test1 = map.testMap(sources, {Max_Row:'B', Max_Col: 2}, { pack: 1, split: 2, split_mode: 'serial'});

            // target options:  transfer_qty, transfer_qty_units, format: N, sample_type: N, split: N, pack_wells: N, split_mode: serial/parallel,  

            it('serial split: A,A,B,B,C,C...', function () {
              assert.equal('1,1,2,2,3,3,4,4,5,5,6,6', test1[0]);
              assert.equal('A1,A1,A2,A2,A3,A3,B1,B1,B2,B2,B3,B3', test1[1]);
              assert.equal('0-A1,0-A2,0-B1,0-B2,1-A1,1-A2,1-B1,1-B2,2-A1,2-A2,2-B1,2-B2', test1[2])
            });
        });

    });
});
