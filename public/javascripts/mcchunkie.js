$( document).ready( function() {
	$.ajax( {
		url: '/brains',
		type: 'GET',
		success: function( data ) {
			console.log( data );
			var table = $( '<table id="brains_table">' );
			table.append( $( '<thead><tr><th>word</th><th>funny</th><th>notfunny</th></thead>' ) );
			var cssClass = 'notfunny';
			for ( var word in data[0].words ) {
				var funny = data[0].words[word].funny || 0;
				var notfunny = data[0].words[word].notfunny || 0;

				if ( funny > notfunny ) cssClass = 'funny';

				var tr = $( '<tr>' ).addClass( cssClass );

				var w = $( '<td>' ).html( word );
				var f = $( '<td>' ).html( funny );
				var n = $( '<td>' ).html( notfunny );


				table.append( tr.append( w ).append( f ).append( n ) );
			}

			$( '#brain' ).append( table );
			$( '#brains_table' ).tablesorter();
		},
		error: function( xhr, stat, err ) {
			alert( stat + " : " + err );
		}
	});
});
