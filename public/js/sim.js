// ==========================================
// Ideamart Group Simulator
// ==========================================
// Author   : Pasindu De Silva
// License  : MIT (c) Pasindu De Silva
// Github   : http://github.com/pasindud
// ==========================================

var numbers = [];
var date =new Date();
var date=date.toUTCString();
var reqid=0;
var socket = io.connect('localhost');
 
 socket.on('incomming', function (data) {
   incnmsg(data);
 });
  socket.on('broadcast', function (data) {
   broadcast(data);
 });
 socket.on('tabs', function (data) {
 	
   tabAdd(data.sel, data.id, data.label, data.content, data.show);
 });
 socket.on('logs', function (data) {
 		if (data.msg=='Success') {
			toastr.success('Sent Sucessfully');
			outlog(data.sms,'Success',data.num);
		} else {
			toastr.warning('Delivery Failed <br> Check the APP URL');
			outlog(data.sms,'Failed',data.num);
		}
 });

// Add Tabs Dynamically
function tabAdd(sel, id, label, content, show){
    var tabs = $(sel);
	numbers.push(id);
    $('div.active', tabs).removeClass('in').add($('li.active', tabs)).removeClass('active');
    $('#myTabContent').append('<div class="tab-pane in active" id="'+id+'">'+content+'</div>');
    $('#myTab').append('<li><a href="#'+id+'" data-toggle="tab">'+label+'</a></li>');
    if(show==true) $('.nav-tabs a:last').tab('show');
}

// Add a new tab to tab
function addnumber (id) {
	var phnum=document.getElementById("newnumber").value;
	if (phnum=='') {alerts ("msgalt",'Number should not be empty','error'); return false;};

	phnum = phnum.replace(/(^\s+|\s+$)/g,' ');

	
	var date =new Date();
	date=date.toUTCString();
	var inner="<div id='"+phnum+"' class='tab-pane fade in active'>";
	inner+="<div class='"+phnum+"-msg'>";
	inner+="<input type='text' id='msg_to_send_"+phnum+"' placeholder='Type the msg you want to send'>";
	inner+="<br><button id='sendmsgs'  num="+phnum+" class='btn'>Send the Message</button>";
	inner+="</div><br><button class='btn' id='cleartbl' num="+phnum+" >Clear</button><br><table style='width:100%;' id='smsin_"+phnum+"' class='table table-bordered'><thead><tr><th>Time</th><th>Incoming Message</th></tr></thead><tbody><tr><td>"+date+"</td><td>Created Phone Number...</td> </tr></tbody></table></div>";
	
	for (var i = 0; i < numbers.length; i++) {
		if (numbers[i]==phnum) {
			alerts ("msgalt",'Number is already added','error');
			return false;
		}
	}
	socket.emit('tabs', { sel:'#tabs',id: phnum,label:phnum , content:inner ,show:true });
	//tabAdd('#tabs', phnum,phnum , inner, true);
}


function erromsg (arg) {
document.getElementById("msgalt").innerHTML=' <div class="alert alert-error"><a class="close" data-dismiss="alert" href="#">&times;</a>'+arg+'</div>';
}

// Handle incomming msg
function incnmsg (data) {
	for (var j = 0; j < data.destinationAddresses.length; j++) {
		for (var i = 0; i < numbers.length; i++) {
			if (data.destinationAddresses[j]==numbers[i]) {
			$('#smsin_'+data.destinationAddresses[j]+' tbody tr:first').before('<tr><td>'+date+'</td><td>'+data.message+'</td></tr>');
   			simlog (data.message,data.destinationAddresses,'Incoming');
			} 
		}
	}
}

// This is a broadcast msg
function broadcast (data) {
    for (var i = 0; i < numbers.length; i++) {
 		$('#smsin_'+numbers[i]+' tbody tr:first').before('<tr><td>'+date+'</td><td>'+data.message+'</td></tr>');
	}
	simlog (data.message,'All','Broadcast');
}

// Generate alerts
function alerts (place,arg,type) {
document.getElementById(place).innerHTML=' <div class="alert alert-'+type+'"><a class="close" data-dismiss="alert" href="#">&times;</a>'+arg+'</div>';
}

$(document).ready(function(){


	var appid='';
	var apppw='';
	var appurl='';

	$("#cleartbl").live('click', function(){
		var num =$(this).attr('num');
		$('#smsin_'+num+' tbody tr').remove();
		$('#smsin_'+num+' tbody').append('<tr><td>'+date+'</td><td>Log Cleared...</td></tr>');
	});

	$("#saveapp").live('click', function(){
			appid=document.getElementById('inputappid').value;
			apppw=document.getElementById('inputapppassword').value;
			appurl=document.getElementById('inputappurl').value;
		if (appid =='' || apppw =='' || appurl =='') {
			alerts ("appalt",'Fill all the fields','error');
		} else {
			alerts('appalt','Configured Sucessfully','success')
		}
	});

	$("#sendmsgs").live('click', function(){

		if (appid =='' || apppw =='' || appurl =='') {
			erromsg ('Config the app url');
			return false;
		} 
		var num =$(this).attr('num');
		var msg=document.getElementById('msg_to_send_'+num).value;
		var postmsg ={message:msg,requestId:++reqid,applicationId:appid,encoding:0,sourceAddress:num,version:'1.0'};

		console.log(postmsg);
		
			$.post("http://localhost:8080/sender",{message:postmsg,url: appurl} ,
				function(data, textStatus, jqXHR){
				
				socket.emit('logs', { msg:data.msg, sms:msg, num:num });
			});
	});
});



// Log on the number tab
function outlog (msg,stat,num) {
	$('#smsin_'+num+' tbody tr:first').before('<tr><td>'+date+'</td><td>Sent ['+stat+'] : '+msg+'</td></tr>');
	simlog (msg,num,'Outgoing');
}

// Log the on the simulator tab
function simlog (msg,who,type) {
	$('#simlog tbody tr:first').before('<tr><td>'+date+'</td><td> Sent : '+msg+'</td><td>'+who+'</td><td>'+type+'</td></tr>');
}