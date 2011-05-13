========
ScottBot
========

A "that's what she said" bot that, much like Data in Generations, keeps trying
to better itself.


Requirements
============

* Node_. I'm running 0.4.5. I assume anything that supports the libraries will
  work.

* Redis_. I'm running 2.2.5. Any 2.2.x or higher is probably fine.

* A sense of humor and some patience.

* IRC mates that won't kill you.

.. _Node: http://nodejs.org/
.. _Redis: http://redis.io/


Running
=======

Start scottbot from the command line::

    $ node scottbot.js [options]

If you want to see all the options, use the ``-h`` option. At a minimum, you'll
probably want to specify an IRC server and some channels to join.

scottbot doesn't detach from the terminal or anything fancy like that, and the
error handling is *probably* robust enough to keep anything horrible from
happening. But this isn't exactly production-quality code.

If you really want to run it as a daemon, look at forever_ or supervisord_.

.. _forever: https://github.com/indexzero/forever
.. _supervisord: http://supervisord.org/


Training
========

From IRC
--------
The most important part is going to be training. Your scottbot will start very
dumb (see TODO_) so you need to teach it.

If scottbot made a joke that was funny, or missed a joke, you can say "yes" or
"lol" and it will treat the previous statement in the channel as a positive
example. For example, if your scottbot is named ``mscott`` (the default)::

    <foo> it was really hard
    <foo> mscott: yes
    <mscott> ok!

scottbot has just trained "it was really hard" as an example of "funny". The
next time someone says "it was really hard" (or something similar, this is
Bayesian) you'll probably see::

    <foo> it was really hard
    <mscott> that's what she said

Again, if you reply with "yes" or "lol", scottbot trains. Conversely, if
scottbot makes a terrible joke, you can say "no"::

    <foo> did you close out bug 1234?
    <mscott> that's what she said
    <foo> mscott: no
    <mscott> sorry :(

Now scottbot has trained "did you close out bug 1234" as a "notfunny" example.
You don't have to wait for scottbot to try, you can say "no" and it will train
the previous statement as unfunny. (Unfortunately, right now, it still says
"sorry.")

::

    <foo> when is the freeze date for 1.2.3?
    <foo> mscott: no
    <mscott> sorry :(

scottbot trained "when is the freeze date for 1.2.3" as a "notfunny" example.

From CLI
--------

Once the bot is started ( node scottbot.js ), you will be dropped to a
prompt. From here, you can add users to the ACL and manually set a
phrase to "funny" or "notfunny".  The available commands are: "addUser",
"addFunny", and "rmFunny" ( *TODO: add "rmUser"* ).  The syntax is
<cmd>:<phrase or user>

::

    >addFunny:put it in my inbox
    Adding funny phrase: put it in my inbox
    ok!
    >addUser:potatoman
    Adding user: dbtid
    >rmFunny:nerd
    Removing funny phrase: nerd
    sorry :(
    >


Bootstrapping
-------------

To get scottbot started, I put it into an otherwise empty IRC channel and just
fed it a few "funny" and "notfunny" messages, giving it feedback on each one.
Within a few dozen it was getting pretty good at this. (Which, coincidentally,
is what she said.)


Sharing Training Data
---------------------

1) I really hope your Redis instance is persistent. 2) Multiple scottbot
instances can talk to the same Redis instance to share knowledge.

Right now, I'm running two, one connected to a local ircd so I can feed it
training info, and one connected to a real IRC network. Since they both talk to
the same Redis, training in one helps the other.


.. _TODO:

TODO
====

* Train/bootstrap with `data from Twitter`_.

* Train phrases: ``scottbot: "foo bar" is funny`` (or something).

* Some local bootstrap data and a way to load it.

* A better way to train correct negatives.

* Train when someone else makes a TWSS joke.

* Stemming. It stinks that "stick" and "stuck" don't get trained together.

* Stopwords. Remember that "it", "he" and "she" are crucial to these jokes.

* Don't say "sorry :(" if it didn't just make a joke.

* Potentially get *really* fancy and blend the Bayesian method with other
  tools, like grammatical analysis to look for pronouns without antecedents.
  That's definitely not a priority, though, it's going pretty well as-is.

.. _data from Twitter: http://www.cs.washington.edu/homes/brun/pubs/pubs/Kiddon11.pdf
