require.paths.unshift("./node_modules");

var sys = require("sys");
var st = process.openStdin();

var brain = require("brain"),
	irc = require("irc"),
	options = require("nomnom").opts({
		host: {
			string: "-H HOST, --host=HOST",
			default: "localhost",
			help: "What IRC network to connect to. (Default: localhost)"
		},
		nick: {
			string: "-n NICK, --nick=NICK",
			default: "mscott",
			help: "IRC nick to use. (Default: mscott)"
		},
		channels: {
			string: "-c CHANNELS, --channels=CHANNELS",
			default: "",
			help: "IRC channels to join (comma-separated, no '#')."
		},
		allowed: {
			string: "-a NICKS, --allowed=NICKS",
			default: "",
			help: "IRC nicks to allowed to teach ( comma-seperated )."
		},
		redisHost: {
			string: "--redis-host=HOST",
			default: "localhost",
			help: "Redis host to use. (Default: localhost)"
		},
		redisPort: {
			string: "--redis-port=PORT",
			default: 6379,
			help: "Redis port to use. (Default: 6379)"
		}
	}).parseArgs();

lastLine = {};

var bayes = new brain.BayesianClassifier({
	backend: {
		type: "redis",
		options: {
			hostname: options.redisHost,
			port: options.redisPort,
			name: "scottbot"
		}
	},
	thresholds: {
		funny: 3,
		notfunny: 1
	},
	def: "notfunny"
});

var CHANNELS = options.channels.split(',');
var ALLOWED = options.allowed.split(',');

CHANNELS.forEach(function(channel, i) {
	CHANNELS[i] = '#' + channel.trim();
});

var client = new irc.Client(options.host, options.nick, {
	channels: CHANNELS
});

// Bit to allow me to manually send input and add users to the include list
client.addListener("error", function(msg) {
	console.log(msg);
});

st.addListener( "data", function(d) {
	var string = d.toString().replace( /\n/, '' );
	var parts = string.split( /:/ );

	if ( parts[0] === "addUser" ) {
		sys.print( "Adding user: " + parts[1] + "\n" );
		ALLOWED.push( parts[1] );
	}

if ( parts[0] === "addFunny" ) {
	sys.print( "Adding funny phrase: " + parts[1] + "\n" );
		bayes.train( parts[1], "funny", function() {
			sys.print( "ok!"  + "\n");
		});
	}

	if ( parts[0] === "rmFunny" ) {
		sys.print( "Removing funny phrase: " + parts[1] + "\n" );
		bayes.train( parts[1], "notfunny", function() {
			sys.print( "sorry :("  + "\n");
		});
	}

	sys.print(">");
}).addListener( "end", function() {
});

sys.print(">");

function oc( a ) {
	var o = {};

	for ( var i = 0; i < a.length; i++ ) {
		o[ a[i] ] = "";
	}

	return o;
}

client.addListener("message", function(from, to, message) {
	var target, isChannel = false;

	if ( to in oc( CHANNELS ) ) {
		target = to;
		isChannel = true;
	} else {
		target = from;
	}

	if ( message === "that's what she said" ) {
		isChannel = false;
	}

	if (isChannel) {
		if (message.indexOf(options.nick) == 0) {
			if (message.match(/no/i)) {
				if ( from in oc( ALLOWED )) {
					bayes.train(lastLine[target], "notfunny", function() {
						client.say(target, "sorry :(");
					});
				} else {
					sys.print( "blocking learn request from: " + from + "\n>" );
				}
			} else if (message.match(/yes/i)) {
				if ( from in oc( ALLOWED )) {
					bayes.train(lastLine[target], "funny", function() {
						client.say(target, "ok!");
					});
				} else {
					sys.print( "blocking learn request from: " + from + "\n>" );
				}
			} else if (message.match(/lol/i)) {
				bayes.train(lastLine[target], "funny", function() {});
			} else if (message.match(/br/i)) {
				client.say(target, "Bootie Rockin!");
			} else if (message.match(/hack/i)) {
				client.say(target, "I phear you have rooted me!!");
			} else if (message.match(/o\//i)) {
				client.say(target, "\\o");
			} else if (message.match(/\\o/i)) {
				client.say(target, "o/");
			} else if (message.match(/lsAllowed/i)) {
				client.say(target, ALLOWED.join( ", " ) );
			} else if (message.match(/botsnack/i)) {
				client.say(target, "nom nom nom");
			}
		} else {
			lastLine[target] = message;
			bayes.classify(message, function(category) {
				if (category == "funny") {
					client.say(target, "that's what she said");
				}
			});
		}
	} else {
		client.say( target, message, ", got it!" );
	}

});

client.addListener("invite", function(channel, from) {
	client.join(channel, function() {
		client.say(from, "Joined " + channel);
	});
});
