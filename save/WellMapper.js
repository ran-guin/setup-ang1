function wellMapper() {

    // Function: 
    //
    // ***********
    // colourMap 
    // ***********
    //
    // This generates a default colour map of NxN matrices for visualization purposes
    // (designed to illustrate mapping of samples on an 8x12 well plate using various shades of spectrum colours)
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
    //      fill_by = 'ros'     : indicates whether ordering of sample distribution occurs by row or by column
    //      mode = 'parallel'   : indicates whether distribution is applied in 'parallel' or 'serially'
    //      batch = M       : indicates that M wells are to be handled together (as with multi-channel pipette)
    //                          (this is only applicable when split > 1 and mode = 'parallel')
    //
    //  Returns attributes: 
    //   targetMap : hash (kys = colours;  values = array of rgb values corresponding to gradually lighter shades of colour) 

    this.colours = [];
    this.rgbList = [];
    this.Map = {};

    this.colourMap = function (N, shades) {

        N = 8;          // Number of colours
        shades = 12;    // Number of shades


        var list = [];
        
        var colourList = ['red','purple','blue','teal','green','yellow','organge','brown', 'grey'];
        var hex = ['00','1a','33','4d','66','80','99','b3','cc','e6','ff'];  // domain of rgb values to use 

        // define array of starting points for rgb values (eg N -> hex[N] for each colour)
        var reds = [7, 5, 0, 0, 0, 7, 6, 2, 1];
        var greens = [0, 0, 0, 5, 4, 7, 1, 1, 1];
        var blues = [0, 5, 5, 5, 0, 0, 2, 0, 1];

        var Map = {};    
        var rgbList = [];
        var colours = [];

        var maxIndex = hex.length - 1;

        for (var c=0; c<N; c++) {
            colours.push(colourList[c]);
            Map[colours[c]] = [];

            var red = reds[c];
            var green = greens[c];
            var blue = blues[c];

            for (var i=1; i<=shades; i++) {

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
                else if (red) {
                    if (green == red) { green++ }
                    if (blue == red) { blue++ }
                    red++;
                }
                else if (green) {
                    if (red == green) { red++ }
                    if (blue == green) { blue++ }
                    green++
                }
                else if (blue) {
                    if (red == blue) { red++ }
                    if (green == blue) { green++ }
                    blue++
                }       

                var rgb = hex[red] + hex[green] + hex[blue];

                Map[colours[c]].push(rgb);
                rgbList.push(rgb);
            }
        }
        
        this.colours = colours;
        this.rgbList = rgbList;
        this.Map = Map;
 
        return { Map : Map, list : rgbList, colours : colours }
    },

    this.col = function () {

        return this.colours;
    },

    this.from = function ( sources ) {
        var rows = ['A', 'B','C', 'D'];
        var cols = [1,2,3,4,5,6];
       
        this.source_cols = cols;
        this.source_rows = rows;

        var options = {
            rows : rows,
            cols : cols,
        }

    },

    this.distribute = function ( options ) {

        var targetMap = [];
        options = {};

        var sources = [{ id: 1, type: 'blood', position: 'A1'}, { id : 2, type : 'blood', position : 'A2'}];
        var rows = options.rows || this.source_rows;
        var cols = options.cols || this.source_cols;

        var fill_by = 'column';
        var batch = 1;

        var x_min = rows[0];
        var x_max = rows[rows.length-1];
        var y_min = cols[0];
        var y_max = cols[cols.length-1];

        var x = x_min;  
        var y = y_min;  

/*
        var array = [];
        var rearray = [];

        var map = {};
        var Target = [];
        var Colour = [];

        var target_index = 0;
        var targets = ['T0:']; // CUSTOM TEST
*/
        var Target = [];
        var Colour = [];
        var target_index = 0;
        var target_position = x_min + y_min.toString();

        Target[target_index] = {};
        Target[target_index][target_position] = sources[0];

        for (var i=1; i<sources.length; i++) {
            if (fill_by == 'row') {
                y++;
                if (y > y_max) {
                    y = 1;
                                        
                    if (x == x_max) {
                        x=x_min;
                        y = y_min;
                        target_index++;       // next plate ... 
                    }
                    else {
                        console.log("x = " + x + " : " + x_min);
                        x = String.fromCharCode(x.charCodeAt(0) + 1);
                    }
                }
            }
            else {
                if (x == x_max) {
                    x=x_min;
                    if (y >= y_max) {
                        y=y_min;
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

            var target_position = x + y.toString();
            
            if (! Target[target_index]) { Target[target_index] = {} }
            if (! Colour[target_index]) { Colour[target_index] = {} }

            Target[target_index][target_position] = sources[i];
            Colour[target_index][target_position] = this.rgbList[i];

            //rearray.push([sources[i], Container.position(sources[i]), targets[target_index], target_position]);
        }

        this.Targets = Target;
        this.TargetMap = Colour;


        return { Targets : Target, TargetMap : Colour };
    }

}