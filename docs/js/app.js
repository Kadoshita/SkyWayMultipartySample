navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
// Peerオブジェクト
var peer = new Peer({
	key: '6e837f61-b5f8-4a01-aae5-bb21c54ca930',
	debug: 3
});
var room;
//SkyWayサーバとのコネクションが確立した際に発生します。
peer.on('open', function(){
	$('#my-id').text(peer.id);
	// メディアの取得を開始
	step1();
});
//エラーが発生したときに発生
peer.on('error', function(err){
	alert(err.message);
	// Return to step 2 if error occurs
	step2();
});
// クリックイベント等の処理
$(function(){
	$('#make-call').submit(function(e){
		e.preventDefault();
		// Roomの設定
		var roomName = $('#join-room').val();
		if (!roomName) {
			return;
		}
		room = peer.joinRoom('sfu_video_' + roomName, {mode: 'sfu', stream: window.localStream});
		$('#room-id').text(roomName);
		step3(room);
	});
	// 通信終了時の処理
	$('#end-call').click(function(){
		room.close();
		$('video').not('#my-video').parent().remove();
		// $('video').not('#my-video').remove();
		// $('label').not('#my-label').remove();
		step2();
	});
	// メディアの再取得
	$('#step1-retry').click(function(){
		$('#step1-error').hide();
		step1();
	});
});
function step1 () {
	// audio,videoストリームの取得
	navigator.getUserMedia({audio: true, video: true},
	function(stream){
		// 自分のvideoストリームを表示
		$('#my-video').prop('src', URL.createObjectURL(stream));
		$('#my-label').text(peer.id + 'のストリームid:' + stream.id);
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
	//他のユーザのストリームを受信した時に発生します。送信者のpeerIdは peerStream.peerIdで取得できます。
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
	//ルームを退出し、ルーム内の全てのコネクションをcloseします。
	room.on('close', step2);
	$('#step1, #step2').hide();
	$('#step3').show();
}