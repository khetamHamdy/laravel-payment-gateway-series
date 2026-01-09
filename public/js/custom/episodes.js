// Video Files
$(function() {
  function usedCombos() {
    const set = new Set();
    $('#video-rows .video-row').each(function(){
      const t = $(this).find('.video-type').val();
      const q = $(this).find('.video-quality').val();
      if (t && q) set.add(t+'_'+q);
    });
    return set;
  }

  function enforceUnique() {
    const seen = {};
    $('#video-rows .video-row').each(function() {
      const $row = $(this);
      const t = $row.find('.video-type').val();
      const q = $row.find('.video-quality').val();
      $row.find('.combo-dup').remove();
      $row.find('.video-type, .video-quality').removeClass('is-invalid');
      if (!t || !q) return;
      const key = t+'_'+q;
      if (seen[key]) {
        $row.find('.video-type, .video-quality').addClass('is-invalid');
        $row.append('<div class="mt-1 text-danger small combo-dup">❌ النوع+الجودة مكرر</div>');
        $('#saveEpisodeBtn').prop('disabled', true);
      } else {
        seen[key] = true;
        $('#saveEpisodeBtn').prop('disabled', false);
      }
    });
  }

  function toggleSource($row, src) {
    const $file = $row.find('.video-file');
    const $url  = $row.find('.video-url');
    const $st   = $row.find('.source-type');
    if (src === 'file') {
      $file.removeClass('d-none').prop('disabled',false);
      $url.addClass('d-none').prop('disabled',true).val('');
      $st.val('file');
    } else {
      $file.addClass('d-none').prop('disabled',true).val('');
      $url.removeClass('d-none').prop('disabled',false);
      $st.val('url');
    }
  }

  function inferFormat($row) {
    const $file = $row.find('.video-file')[0];
    const $url  = $row.find('.video-url');
    let fmt = '';
    if (!$row.find('.video-file').hasClass('d-none') && $file && $file.files && $file.files[0]) {
      const name = $file.files[0].name || '';
      fmt = name.split('.').pop().toLowerCase();
    } else {
      const link = ($url.val() || '').split('?')[0];
      const ext  = link.split('.').pop().toLowerCase();
      if (['mp4','webm','m3u8','hls'].includes(ext)) fmt = ext;
    }
    $row.find('.video-format').val(fmt);
  }

  function initVideoRow($row) {
    toggleSource($row, 'url');
    $row.find('.source-toggle').on('change', function(){
      toggleSource($row, $(this).val());
      inferFormat($row);
    });
    $row.find('.video-file').on('change', function(){ inferFormat($row); });
    $row.find('.video-url').on('input', function(){ inferFormat($row); });
    $row.find('.video-type, .video-quality').on('change', enforceUnique);
    enforceUnique();
  }

  let videoIndex = $('#video-rows .video-row').length ? $('#video-rows .video-row').length - 1 : 0;
  $('#add-video-row').on('click', function(){
    videoIndex++;
    $.get(episodeVideoRowPartial, { i: videoIndex }, function(html){
      const $newRow = $(html);
      $('#video-rows').append($newRow);
      initVideoRow($newRow);
    });
  });

    // حذف صف
    $(document).on('click', '.remove-video-row', function () {
        let row = $(this).closest('.video-row');
        let videoId = row.find('.video-id').val();
        alert('test')
        if (videoId) {
            alert('test')
            // إذا الفيديو موجود مسبقًا في DB → نرسل طلب حذف
            $.ajax({
                url: '/dashboard/episodes-video-files/' + videoId,
                type: 'DELETE',
                data: {
                    _token: $('meta[name="csrf-token"]').attr('content')
                },
                success: function (res) {
                    if (res.status) {
                        row.remove();
                        enforceUniqueVideoCombo(); // إعادة فحص الجودة بعد الحذف
                    } else {
                        alert(res.message);
                    }
                },
                error: function () {
                    alert('حدث خطأ أثناء الحذف!');
                }
            });
        } else {
            // الفيديو جديد ولم يُحفظ بعد → نحذفه مباشرة من الواجهة
            row.remove();
            enforceUniqueVideoCombo();
        }
    });

  // init
  $('#video-rows .video-row').each(function(){ initVideoRow($(this)); });
});

// Subtitles
$(function(){
  const LANG_LABELS = { ar:'العربية', en:'English', fr:'Français', es:'Español', de:'Deutsch', it:'Italiano', tr:'Türkçe', fa:'فارسی', ur:'اردو', ru:'Русский', zh:'中文', ja:'日本語', ko:'한국어' };

  function enforceUniqueLanguage(){
    const seen = {};
    $('#sub-rows .sub-row').each(function(){
      const $row = $(this);
      const lang = ($row.find('.sub-language').val()||'').trim().toLowerCase();
      $row.find('.lang-dup').addClass('d-none'); $row.find('.sub-language').removeClass('is-invalid');
      if (!lang) return;
      if (seen[lang]) { $row.find('.sub-language').addClass('is-invalid'); $row.find('.lang-dup').removeClass('d-none'); }
      else seen[lang]=true;
    });
  }

  function enforceUniqueLabel(){
    const seen = {};
    $('#sub-rows .sub-row').each(function(){
      const $row = $(this);
      const lbl = ($row.find('.sub-label').val()||'').trim();
      $row.find('.label-dup').addClass('d-none'); $row.find('.sub-label').removeClass('is-invalid');
      if (!lbl) return;
      if (seen[lbl]) { $row.find('.sub-label').addClass('is-invalid'); $row.find('.label-dup').removeClass('d-none'); }
      else seen[lbl]=true;
    });
  }

  function enforceSingleDefault($changed){
    if ($changed && $changed.is(':checked')) {
      $('#sub-rows .sub-default').not($changed).prop('checked', false);
    }
  }

  function toggleSource($row, src){
    const $file = $row.find('.sub-file');
    const $url  = $row.find('.sub-url');
    if (src === 'file') {
      $file.removeClass('d-none').prop('disabled',false);
      $url.addClass('d-none').prop('disabled',true).val('');
    } else {
      $file.addClass('d-none').prop('disabled',true).val('');
      $url.removeClass('d-none').prop('disabled',false);
    }
  }

  function autoFillLabel($row){
    const lang = ($row.find('.sub-language').val()||'').trim().toLowerCase();
    const $label = $row.find('.sub-label');
    if (!$label.val()) {
      if (LANG_LABELS[lang]) $label.val(LANG_LABELS[lang]);
      else if (lang) $label.val(lang.toUpperCase());
    }
  }

  function initSubRow($row){
    toggleSource($row,'url');
    $row.find('.sub-source').on('change', function(){ toggleSource($row, $(this).val()); });
    $row.find('.sub-language').on('input', function(){ autoFillLabel($row); enforceUniqueLanguage(); });
    $row.find('.sub-label').on('input', enforceUniqueLabel);
    $row.find('.sub-default').on('change', function(){ enforceSingleDefault($(this)); });
    autoFillLabel($row); enforceUniqueLanguage(); enforceUniqueLabel();
  }

  let subIndex = $('#sub-rows .sub-row').length ? $('#sub-rows .sub-row').length - 1 : 0;
  $('#add-sub-row').on('click', function(){
    subIndex++;
    $.get(episodeSubtitleRowPartial, { i: subIndex }, function(html){
      const $new = $(html);
      $('#sub-rows').append($new);
      initSubRow($new);
    });
  });

    $(document).on('click', '.remove-sub-row', function () {
        let row = $(this).closest('.sub-row');
        let subId = row.find('.sub-id').val();
        if (subId) {
            $.ajax({
                url: '/dashboard/episodes-subtitles/' + subId,
                type: 'DELETE',
                data: {
                    _token: $('meta[name="csrf-token"]').attr('content')
                },
                success: function (res) {
                    if (res.status) {
                        row.remove();
                        enforceUniqueLanguage();
                        enforceUniqueLabel();
                    } else {
                        alert(res.message);
                    }
                },
                error: function () {
                    alert('حدث خطأ أثناء الحذف!');
                }
            });
        } else {
            row.remove();
            enforceUniqueLanguage();
            enforceUniqueLabel();
        }
    });

  // init
  $('#sub-rows .sub-row').each(function(){ initSubRow($(this)); });
});
