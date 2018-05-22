$(function() {

  var passphraseGenerateModal = $('#passphraseGenerateModal');
  var showResultsModal = $('#showResultsModal');
  var passPhrase, wallet, address, privateKey, view;
  var restore_mode = false;

  function movingCompleteCallback() {
    passPhrase = mn_encode(seeder.getPoints());
    $('#passphrase').val(passPhrase);
    $('#passphrase_repeat').val(passPhrase);
    passphraseGenerateModal.modal('hide');
    $('#createWallet').click();
  }

  var seeder = new MouseSeeder(function update_progress_callback(percentage_as_text) {
    $('#moves_required_count').text(percentage_as_text).css({width: percentage_as_text});
  }, movingCompleteCallback);

  $('body').bind('mousemove', seeder.handleMouseMove);

  function cleanGenerateInputs() {
    $('#passphrase').val('');
    $('#passphrase_repeat').val('');
  }

  passphraseGenerateModal.on('show.bs.modal', function(event) {
    seeder.reset();
  });

  passphraseGenerateModal.on('hide.bs.modal', function(event) {
    seeder.resetAndDisable();
  });

  showResultsModal.on('show.bs.modal', function(event) {
    var passPhrase = restore_mode ? $('#passphrase_restore').val() : $('#passphrase').val();
    var wallet = BW.generateWallet(BW.getStringWords(passPhrase));
    var address = wallet.address;
    var privateKey = wallet.privateKey;
	var viewKey = wallet.trackingKey; // view key
    $("#qrcode_address").empty();
    $("#qrcode_private_key").empty();
    $("#qrcode_pass_phrase").empty();
    new QRCode($("#qrcode_address")[0], address);
    new QRCode($("#qrcode_private_key")[0], privateKey);
    new QRCode($("#qrcode_pass_phrase")[0], passPhrase);
    new QRCode($("#qr_tracking_key")[0], viewKey);
    $('#resulting_address').text(address);
    $('#resulting_private_key').text(privateKey);
    $('#resulting_passphrase').text(passPhrase);
    $('#resulting_view_key').text(viewKey);
	
	
  });

  showResultsModal.on('hide.bs.modal', function(event) {
    cleanGenerateInputs();
    $("#qrcode_address").empty();
    $("#qrcode_private_key").empty();
    $("#qrcode_pass_phrase").empty();
    $("#qr_tracking_key").empty();
  });

  setInterval(function watchPassphraseSecurity() {
    var passphrase_length = $('#passphrase').val().split(' ').length;
    var PASSPHRASE_SECURE_LENGTH = 18;
    var percentage = Math.floor(100 * Math.min(passphrase_length, PASSPHRASE_SECURE_LENGTH) / PASSPHRASE_SECURE_LENGTH);
    var text_message = 'too weak (less than 10 words)';
    var progressbar_class = 'progress-bar-danger';
    var input_class = 'has-error';
    var feedback_class = 'glyphicon-remove';
    $('#createWallet').addClass('disabled');
	$('#createWallet').prop('disabled', true);
    if(percentage >= 100) {
      text_message = 'good (at least 18 words)';
      progressbar_class = 'progress-bar-success';
      input_class = 'has-success';
      feedback_class = 'glyphicon-ok-circle';
      $('#createWallet').removeClass('disabled');
	  $('#createWallet').prop('disabled', false);
    }
    else {
      if(percentage > 50) {
        text_message = 'weak (less than 18 words)';
        progressbar_class = 'progress-bar-warning';
        input_class = 'has-warning';
        feedback_class = 'glyphicon-warning-sign';
        $('#createWallet').removeClass('disabled');
		$('#createWallet').prop('disabled', false);
      }
    }

    $('#passphrase_security').css({width: percentage + '%'}).text(text_message)
      .removeClass('progress-bar-danger').removeClass('progress-bar-warning').removeClass('progress-bar-success')
      .addClass(progressbar_class);

    $('#passphrase').parents('.form-group')
      .removeClass('has-error').removeClass('has-success').removeClass('has-warning').addClass(input_class);

    $('#passphrase').parents('.form-group').find('.glyphicon')
      .removeClass('glyphicon-ok-circle').removeClass('glyphicon-warning-sign').removeClass('glyphicon-remove')
      .addClass(feedback_class);

    if($('#passphrase').val() != $('#passphrase_repeat').val()) {
      $('#createWallet').addClass('disabled');
	  $('#createWallet').prop('disabled', true);
      $('#passphrase_repeat').parents('.form-group').removeClass('has-success').addClass('has-error')
        .find('.glyphicon').addClass('glyphicon-warning-sign');
    }
    else {
      $('#passphrase_repeat').parents('.form-group').removeClass('has-error').addClass('has-success')
        .find('.glyphicon').removeClass('glyphicon-warning-sign');
    }
  }, 500);

  $('#createWallet').click(function() {
    restore_mode = false;
    $('#mode_dependant_action').text('created');
    showResultsModal.modal('show');
  });

  $('#restoreWallet').click(function() {
    restore_mode = true;
    $('#mode_dependant_action').text('restored');
    showResultsModal.modal('show');
  });

  setInterval(function watchRestoreButton() {
    var passphrase_provided = !!$('#passphrase_restore').val();
    if(!passphrase_provided) {
      $('#restoreWallet').addClass('disabled');
    }
    else {
      $('#restoreWallet').removeClass('disabled');
    }
  }, 500);

  function printElement(elem, append, delimiter) {
    var domClone = elem.cloneNode(true);

    var $printSection = document.getElementById("printSection");

    if(!$printSection) {
      $printSection = document.createElement("div");
      $printSection.id = "printSection";
      document.body.appendChild($printSection);
    }

    if(append !== true) {
      $printSection.innerHTML = "";
    }

    else {
      if(append === true) {
        if(typeof (delimiter) === "string") {
          $printSection.innerHTML += delimiter;
        }
        else {
          if(typeof (delimiter) === "object") {
            $printSection.appendChlid(delimiter);
          }
        }
      }
    }

    $printSection.appendChild(domClone);
  }

  $('#print_results').click(function() {
    printElement($('#showResultsModal .modal-body')[0]);
    window.print();
  });

});
