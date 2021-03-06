(function(){
	var oldData='';
	var km_fname = '';
	var html = '';
	var win_title = '';
	html += '<a class="diy export" data-type="json">导出json</a>',
	html += '<a class="diy export" data-type="md">导出md</a>',
	html += '<a class="diy export" data-type="km">导出km</a>',
	html += '<button class="diy input">',
	html += '导入<input type="file" id="fileInput">',
	html += '</button>',
	html += '<textarea class="diy input" id="prompt_txt">',
	html +='</textarea>';    

	$('.editor-title').append(html);

	$('.diy').css({
		// 'height': '30px',
		// 'line-height': '30px',
		'margin-top': '0px',
		'float': 'right',
		'background-color': '#fff',
		'min-width': '60px',
		'text-decoration': 'none',
		color: '#999',
		'padding': '0 10px',
		border: 'none',
		'border-right': '1px solid #ccc',
	});
	$('.input').css({
		'overflow': 'hidden',
		'position': 'relative',
	}).find('input').css({
		cursor: 'pointer',
		position: 'absolute',
		top: 0,
		bottom: 0,
		left: 0,
		right: 0,
		display: 'inline-block',
		opacity: 0
	});
	$('.export').css('cursor','not-allowed');

	$(document).on('mouseover', '.export', function(event) {
		// 链接在hover的时候生成对应数据到链接中
		event.preventDefault();
		var $this = $(this),
				type = $this.data('type'),
				exportType;
		switch(type){
			case 'km':
				exportType = 'json';
				break;
			case 'md':
				exportType = 'markdown';
				break;
			default:
				exportType = type;
				break;
		}
		if(JSON.stringify(oldData) == JSON.stringify(editor.minder.exportJson())){
			return;
		}else{
			oldData = editor.minder.exportJson();
		}

		editor.minder.exportData(exportType).then(function(content){
			switch(exportType){
				case 'json':
					console.log($.parseJSON(content));
					break;
				default:
					console.log(content);
					break;
			}
			$this.css('cursor', 'pointer');
			var blob = new Blob([content]),
					url = URL.createObjectURL(blob);
			var aLink = $this[0];
			aLink.href = url;
			aLink.download = $('#node_text1').text()+'.'+type;
            //$.post("http://127.0.0.1:8080/", {name:'123'}, function(data,status){alert("Data: " + data + "\nStatus: " + status);});
            //console.log('after post');
		});
	}).on('mouseout', '.export', function(event) {
		// 鼠标移开是设置禁止点击状态，下次鼠标移入时需重新计算需要生成的文件
		event.preventDefault();
		//$(this).css('cursor', 'not-allowed');
	}).on('click', '.export', function(event) {
		// 禁止点击状态下取消跳转
		var $this = $(this);
		if($this.css('cursor') == 'not-allowed'){
			//event.preventDefault();
		}
	});

	window.setInterval(
		function(){
			if (win_title != $('#node_text1').text()) {
				win_title = $('#node_text1').text();
				document.title = win_title;
			}
			if (oldData == '') {
				oldData = editor.minder.exportJson();
				return;
			}            
			if(JSON.stringify(oldData) == JSON.stringify(editor.minder.exportJson())){
				return;
			}else{
				oldData = editor.minder.exportJson();
			}
			exportType='json';
			editor.minder.exportData(exportType).then(function(content){                               
				$.ajax({
					type: "POST",  
					url: "upload.php?fname="+encodeURI(km_fname)+"&text="+$('#node_text1').text(), 
					data: JSON.stringify(content),
					success: function(msg){
					//alert( "Data Saved: " + msg ); 
			myDate = new Date();
			txt=document.getElementById('prompt_txt');
			txt.value = myDate.getHours() + ":" + myDate.getMinutes() + ":" + myDate.getSeconds() + " : " + msg;
					}
				});               
			});
	        }, 
        5000);

	// 导入
	window.onload = function() {
		var fileInput = document.getElementById('fileInput');
        
        $("#kity_svg_6").css("background-color", '#cbe8cf');

		fileInput.addEventListener('change', function(e) {
			var file = fileInput.files[0],
					// textType = /(md|km)/,
					fileType = file.name.substr(file.name.lastIndexOf('.')+1);
			console.log(file);
			km_fname=file.name;
			switch(fileType){
				case 'md':
					fileType = 'markdown';
					break;
				case 'km':
				case 'json':
					fileType = 'json';
					break;
				default:
					console.log("File not supported!");
					alert('只支持.km、.md、.json文件');
					return;
			}
			var reader = new FileReader();
			reader.onload = function(e) {
				var content = reader.result;
				editor.minder.importData(fileType, content).then(function(data){
					console.log(data);
					$(fileInput).val('');
					oldData = editor.minder.exportJson();
					if (win_title != $('#node_text1').text()) {
						win_title = $('#node_text1').text();
						document.title = win_title;
					}                    
				});
			}
			reader.readAsText(file);
		});
	}

})();
