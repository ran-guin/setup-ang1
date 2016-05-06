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

    this.colourMap = function (N, shades) {

        N = 8;          // Number of colours
        shades = 12;    // Number of shades


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

            for (var i=0; i<shades; i++) {

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
        console.log("CMAP: " + JSON.stringify(CMap));

        this.colours = colours;
        this.rgbList = rgbList;

        this.Map = Map;
 
        return { Map : Map, list : rgbList, colours : colours }
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

    /* Get next available position */
    this.next_position = function (x, y, target_index) {
        if (this.fill_by == 'Row') {
            // console.log("fill by row to " + this.x_max + this.y_max);
            y++;
            if (y > this.y_max) {
                y = 1;
                                    
                if (x == this.x_max) {
                    x=this.x_min;
                    y = this.y_min;
                    target_index++;       // next plate ... 
                }
                else {
                    x = String.fromCharCode(x.charCodeAt(0) + 1);
                }
            }
        }
        else {
            // console.log("fill by col to " + this.x_max + this.y_max);
            if (x == this.x_max) {
                x=this.x_min;
                if (y >= this.y_max) {
                    y=this.y_min;
                    target_index++;       // next plate ... 
                }
                else {
                    y++;
                }
            }   
            else {
                x = String.fromCharCode(x.charCodeAt(0) + 1);
            }

        }
        // console.log("next: " + x + y + ' [ ' + target_index + ' ]');
        return { x: x, y: y, target_index: target_index};
    }

    this.initialize = function ( Target ) {
       //var sources = [{ id: 1, type: 'blood', position: 'A1'}, { id : 2, type : 'blood', position : 'A2'}];
        
        var rows = Target.rows || this.source_rows;  // unnecessary..
        var cols = Target.cols || this.source_cols;

        this.fill_by = Target.fillBy || 'Row';
        this.pack = Target.pack || false;
        this.preserve_position = ! this.pack; // unnecessary... 
        this.split_mode = Target.split_mode || 'parallel';

        this.x_min = Target.min_row || 'A';
        this.x_max = Target.max_row || 'A';
        this.y_min = Target.min_col || 1;
        this.y_max = Target.max_col || 1;

        this.splitX = Target.split || Target.splitX || 1;

        console.log("\nsplit = " + this.splitX + "\nfillBy = " + this.fill_by + "\npack = " + this.pack + "\nmode = " + this.split_mode + "\ntarget_size = " + this.x_max + this.y_max+ "\n");
    }

    this.distribute = function ( sources, Target ) {

        var targetMap = [];
        if (! Target) { Target = {} };
        if (! sources) { 
            console.log("Missing Source or Target information");
            return {}
        }

        console.log("run distribute function... ");
        console.log(sources.length + " Sources: " + JSON.stringify(sources));
        console.log("Target: " + JSON.stringify(Target));

        this.initialize(Target);

        var x = this.x_min;  
        var y = this.y_min;  

        var Transfer = [];
        var Colour = [];
        var target_index = 0;
        var target_position = this.x_min + this.y_min.toString();

        Transfer[target_index] = {};
        Transfer[target_index][target_position] = sources[0];

        Colour[target_index] = {};
        Colour[target_index][target_position] = this.rgbList[0];

        var repeat_set = 1;
        var repeat_wells = 1;

        if ( ! this.pack ) {
            // positions are static ... simply copy plates (x split if necessary)
        }
        else {

            if (this.split_mode === 'serial') { 
                repeat_wells = this.splitX;
            }
            else { 
                repeat_set = this.splitX;
            }

            for (var h=1; h<=repeat_set; h++) {  // only repeats when split in parallel mode

                for (var i=0; i<sources.length; ) {

                    for (var j=1; j<=this.pack && i<sources.length; j++) {   // force use of consecutive wells if pack > 1 (even if in serial mode)
                        for (var k=1; k<=repeat_wells && i<sources.length; k++) {

                            var target_position = x + y.toString();
                            
                            if (! Transfer[target_index]) { Transfer[target_index] = {} }
                            if (! Colour[target_index]) { Colour[target_index] = {} }

                            console.log('box #' + target_index + '-' + target_position + ' = container #' + sources[i].id + ' from ' + sources[i].position);

                            Transfer[target_index][target_position] = sources[i];
                            Colour[target_index][target_position] = this.rgbList[i];
                            //rearray.push([sources[i], Container.position(sources[i]), targets[target_index], target_position]);

                            var next = this.next_position(x,y,target_index);
                            x = next.x;
                            y = next.y;
                            target_index = next.target_index;
                        }
                        i = i+1;
                    }
                }
            }
        }

        this.Transfer = Transfer;
        this.TransferMap = Colour;

        return { Transfer : Transfer, TransferMap : Colour };
    }

    this.testFunction = function (number) {
        console.log('ok');
        return number*2;
    }

    this.testMap = function (sources, Target) {
        // used simply to generate easily testable strings showing sample distributions
        // this is used by unit tests below to test ordered list of ids, source positions, target_positions

        var results = this.distribute(sources, Target);
        
        var id_list = [];
        var position_list = [];
        var targets = [];

        for (var i=0; i<this.Transfer.length; i++) {
            var keys = Object.keys(this.Transfer[i]);
            for (var j=0; j<keys.length; j++) {
                var source = this.Transfer[i][keys[j]];
                id_list.push(source.id);
                position_list.push(source.position);
                var target_position = i + '-' + keys[j];
                targets.push(target_position);
            }
        }

        return [ id_list.join(','), position_list.join(','), targets.join(',') ];
    }
}

/* Unit Tests */

var assert = require('chai').assert;

describe('wellMapper()', function() {
 
    describe('* initialization', function () {
        var map = new wellMapper();
        map.initialize( { min_col : 3, max_row : 'D', max_col : 7 } );

        it('simple initialization', function () {
            assert.equal('A', map.x_min);
            assert.equal('D', map.x_max);
            assert.equal(3,   map.y_min);
            assert.equal(7,   map.y_max);

        });
    });

    // quite extensive set of tests to ensure distribution of wells follows expectations
    describe('* distribute', function () {

        var Target = { max_row : 'B', max_col : 3 };
    
        var ids = [1,2,3,4,5,6]
        var positions = ['A1','A2','A3','B1','B2','B3'];

        var sources = [];
        for (var i=0; i<6; i++) {
            sources.push( { id: ids[i], position: positions[i] });
        }

        describe('= default', function () {

            var map = new wellMapper();
            var test1 = map.testMap(sources, { pack: 1, max_row : 'B', max_col : 2 });

            // target options:  transfer_qty, transfer_qty_units, format: N, sample_type: N, split: N, pack_wells: N, split_mode: serial/parallel,  

            it('simple 1 to 1 default transfer', function () {
              assert.equal('1,2,3,4,5,6', test1[0]);
              assert.equal('A1,A2,A3,B1,B2,B3', test1[1]);
              assert.equal('0-A1,0-A2,0-B1,0-B2,1-A1,1-A2', test1[2])
            });
        });

       describe('= parallel split', function () {

            var map = new wellMapper();
            var test1 = map.testMap(sources, { pack: 1, split: 2, max_row : 'B', max_col : 2 });

            // target options:  transfer_qty, transfer_qty_units, format: N, sample_type: N, split: N, pack_wells: N, split_mode: serial/parallel,  

            it('parallel split: A,B,C.. A,B,C', function () {
              assert.equal('1,2,3,4,5,6,1,2,3,4,5,6', test1[0]);
              assert.equal('A1,A2,A3,B1,B2,B3,A1,A2,A3,B1,B2,B3', test1[1]);
              assert.equal('0-A1,0-A2,0-B1,0-B2,1-A1,1-A2,1-B1,1-B2,2-A1,2-A2,2-B1,2-B2', test1[2])
            });
        });

        describe('= serial split', function () {

            var map = new wellMapper();
            var test1 = map.testMap(sources, { pack: 1, split: 2, split_mode: 'serial', max_row : 'B', max_col : 2 });

            // target options:  transfer_qty, transfer_qty_units, format: N, sample_type: N, split: N, pack_wells: N, split_mode: serial/parallel,  

            it('serial split: A,A,B,B,C,C...', function () {
              assert.equal('1,1,2,2,3,3,4,4,5,5,6,6', test1[0]);
              assert.equal('A1,A1,A2,A2,A3,A3,B1,B1,B2,B2,B3,B3', test1[1]);
              assert.equal('0-A1,0-A2,0-B1,0-B2,1-A1,1-A2,1-B1,1-B2,2-A1,2-A2,2-B1,2-B2', test1[2])
            });
        });

    });
});
