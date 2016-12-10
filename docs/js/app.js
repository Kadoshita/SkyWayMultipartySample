// Compatibility shim
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
// Peer object
var peer = new Peer({
	key: '6e837f61-b5f8-4a01-aae5-bb21c54ca930',
	debug: 3
});
var room;
peer.on('open', function(){
	$('#my-id').text(peer.id);
	// Get things started
	step1();
});
peer.on('error', function(err){
	alert(err.message);
	// Return to step 2 if error occurs
	step2();
});
// Click handlers setup
$(function(){
	$('#make-call').submit(function(e){
		e.preventDefault();
		// Initiate a call!
		var roomName = $('#join-room').val();
		if (!roomName) {
			return;
		}
		room = peer.joinRoom('sfu_video_' + roomName, {mode: 'sfu', stream: window.localStream});
		$('#room-id').text(roomName);
		step3(room);
	});
	$('#end-call').click(function(){
		room.close();
		step2();
	});
	// Retry if getUserMedia fails
	$('#step1-retry').click(function(){
		$('#step1-error').hide();
		step1();
	});
});
function step1 () {
	// Get audio/video stream
	navigator.getUserMedia({audio: true, video: true},
	function(stream){
		// Set your video displays
		$('#my-video').prop('src', URL.createObjectURL(stream));
		$('#my-label').text(peer.id + ':' + stream.id);
		window.localStream = stream;
		step2();
	},
	function(){
		$('#step1-error').show();
	});
}
function step2 () {
	$('#step1, #step3').hide();
	$('#step2').show();
	$('#join-room').focus();
}
function step3 (room) {
	// Wait for stream on the call, then set peer video display
	room.on('stream', function(stream){
		const streamURL = URL.createObjectURL(stream);
		const peerId = stream.peerId;
		$('#their-videos').append($(
			'<div>' +
			'<label id="label_' + peerId + '">' + stream.peerId + ':' + stream.id + '</label>' +
			'<video autoplay class="remoteVideos" src="' + streamURL + '" id="video_' + peerId + '">' +
			'</div>'
		));
	});
	room.on('removeStream', function(removedStream) {
		$('#video_' + removedStream.peerId).remove();
		$('#label_' + removedStream.peerId).remove();
	});
	// UI stuff
	room.on('close', step2);
	$('#step1, #step2').hide();
	$('#step3').show();
}