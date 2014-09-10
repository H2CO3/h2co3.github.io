(function() {
	var code = document.getElementById('code');
	var console = document.getElementById('console');
	var runButton = document.getElementById('runbutton');
	var clearButton = document.getElementById('clrscr');
	var flushButton = document.getElementById('flushio');
	var resetButton = document.getElementById('reset');

	var resetChkBox = document.getElementById('always_reset');
	var asExprChkBox = document.getElementById('as_expr');

	function flushIOStreams() {
		var stdout = Sparkling.getGlobal('stdout');
		var stderr = Sparkling.getGlobal('stderr');
		var fprintf = Sparkling.getGlobal('fprintf');
		fprintf(stdout, "\n");
		fprintf(stderr, "\n");
		// compensate the two newlines
		console.value = console.value.substr(0, console.value.length - 2);
	}

	runButton.addEventListener('click', function(evt) {
		if (resetChkBox.checked) {
			Sparkling.reset();
		}

		var compiler = asExprChkBox.checked ? Sparkling.compileExpr : Sparkling.compile;

		var fn = compiler(code.value);
		var print = Sparkling.getGlobal('print');
		var dbgprint = Sparkling.getGlobal('dbgprint');
		var retVal;

		if (fn) {
			try {
				retVal = fn();
				flushIOStreams();
				console.value += "=> ";
				if (typeof retVal === 'string') {
					dbgprint(retVal);
				} else {
					print(retVal);
				}
				flushIOStreams();
			} catch (e) {
				Module.printErr(Sparkling.lastErrorMessage());
			}
		} else {
			Module.printErr(Sparkling.lastErrorMessage());
		}
	});

	clearButton.addEventListener('click', function(evt) {
		console.value = "";
	});

	flushButton.addEventListener('click', flushIOStreams);

	resetButton.addEventListener('click', function(evt) {
		console.value = "";
		Sparkling.reset();
	});

	Module.print = Module.printErr = function(str) {
		console.value += str + "\n";
		console.scrollTop = console.scrollHeight;
	};
}());
