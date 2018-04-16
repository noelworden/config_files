# =================================================================================================
#
# Filtering State/Province Based on Country
#
# ==================================================================================================


# ------------------------------------------------
# Create Filters Object
# ------------------------------------------------

GA_LABEL_MAPPING =
  marketing_pages_show: 'Marketing LP'
  residence_index: 'Residences'
  static_register: 'Register Interest - Page'
  overlay: 'Overlay'

class window.WardVillage.Registration
  constructor: (element) ->
    @isEnabled = false
    @requiredFields = []
    @errorResponses = {}
    @$errorEl = null
    @$registerForm = $(element)
    @isModal = false
    @countryField = '00Ni000000FlJ6K'
    @stateField = '00Ni000000FlJ6F'
    @langField = '00Ni000000A20c4'
    @whereField ='00Ni000000D08UT'
    @empty = '<option value="null">N/A</option>'
    @au = '<option value="ACT">Australian Capital Territory</option>
           <option value="NSW">New South Wales</option>
           <option value="NT">Northern Territory</option>
           <option value="QLD">Queensland</option>
           <option value="SA">South Australia</option>
           <option value="TAS">Tasmania</option>
           <option value="VIC">Victoria</option>
           <option value="WA">Western Australia</option>'
    @ca = '<option value="AB">Alberta</option>
          <option value="BC">British Columbia</option>
          <option value="MB">Manitoba</option>
          <option value="NB">New Brunswick</option>
          <option value="NL">Newfoundland and Labrador</option>
          <option value="NT">Northwest Territories</option>
          <option value="NS">Nova Scotia</option>
          <option value="NU">Nunavut</option>
          <option value="ON">Ontario</option>
          <option value="PE">Prince Edward Island</option>
          <option value="QC">Quebec</option>
          <option value="SK">Saskatchewan</option>
          <option value="YT">Yukon Territories</option>'
    @cn = '<option value="ANH">Anhui</option>
          <option value="BEI">Beijing</option>
          <option value="CHO">Chongqing</option>
          <option value="FUJ">Fujian</option>
          <option value="GAN">Gansu</option>
          <option value="GDG">Guangdong</option>
          <option value="GXI">Guangxi</option>
          <option value="GUI">Guizhou</option>
          <option value="HAI">Hainan</option>
          <option value="HEB">Hebei</option>
          <option value="HEI">Heilongjiang</option>
          <option value="HEN">Henan</option>
          <option value="HUB">Hubei</option>
          <option value="HUN">Hunan</option>
          <option value="JSU">Jiangsu</option>
          <option value="JXI">Jiangxi</option>
          <option value="JIL">Jilin</option>
          <option value="LIA">Liaoning</option>
          <option value="MON">Nei Mongol</option>
          <option value="NIN">Ningxia</option>
          <option value="QIN">Qinghai</option>
          <option value="SHA">Shaanxi</option>
          <option value="SHD">Shandong</option>
          <option value="SHH">Shanghai</option>
          <option value="SHX">Shanxi</option>
          <option value="SIC">Sichuan</option>
          <option value="TIA">Tianjin</option>
          <option value="XIN">Xinjiang</option>
          <option value="XIZ">Xizang</option>
          <option value="YUN">Yunnan</option>
          <option value="ZHE">Zhejiang</option>'
    @in = '<option value="AN">Andaman and Nicobar Islands</option>
          <option value="AP">Andhra Pradesh</option>
          <option value="AR">Arunachal Pradesh</option>
          <option value="AS">Assam</option>
          <option value="BR">Bihar</option>
          <option value="CH">Chandigarh</option>
          <option value="CT">Chhattisgarh</option>
          <option value="DN">Dadra and Nagar Haveli</option>
          <option value="DD">Daman and Diu</option>
          <option value="DL">Delhi</option>
          <option value="GA">Goa</option>
          <option value="GJ">Gujarat</option>
          <option value="HR">Haryana</option>
          <option value="HP">Himachal Pradesh</option>
          <option value="JK">Jammu and Kashmir</option>
          <option value="JH">Jharkhand</option>
          <option value="KA">Karnataka</option>
          <option value="KL">Kerala</option>
          <option value="LD">Lakshadweep</option>
          <option value="MP">Madhya Pradesh</option>
          <option value="MH">Maharashtra</option>
          <option value="ME">Meghalaya</option>
          <option value="MN">Manipur</option>
          <option value="MZ">Mizoram</option>
          <option value="NL">Nagaland</option>
          <option value="OR">Odisha</option>
          <option value="PY">Puducherry</option>
          <option value="PB">Punjab</option>
          <option value="RJ">Rajasthan</option>
          <option value="SK">Sikkim</option>
          <option value="TN">Tamil Nadu</option>
          <option value="TR">Tripura</option>
          <option value="UT">Uttarakhand</option>
          <option value="UP">Uttar Pradesh</option>
          <option value="WB">West Bengal</option>'
    @it = '<option value="AG">Agrigento</option>
          <option value="AL">Alessandria</option>
          <option value="AN">Ancona</option>
          <option value="AO">Aosta</option>
          <option value="AP">Ascoli Piceno</option>
          <option value="AQ">L\'Aquila</option>
          <option value="AR">Arezzo</option>
          <option value="AT">Asti</option>
          <option value="AV">Avellino</option>
          <option value="BA">Bari</option>
          <option value="BG">Bergamo</option>
          <option value="BI">Biell</option>
          <option value="BL">Belluno</option>
          <option value="BN">Benevento</option>
          <option value="BO">Bologna</option>
          <option value="BR">Brindisi</option>
          <option value="BS">Brescia</option>
          <option value="BT">Barletta-Andria-Trani</option>
          <option value="BZ">Bolzano</option>
          <option value="CA">Cagliari</option>
          <option value="CB">Campobasso</option>
          <option value="CE">Caserta</option>
          <option value="CH">Chieti</option>
          <option value="CI">Carbonia-Iglesias</option>
          <option value="CL">Caltanissetta</option>
          <option value="CN">Cuneo</option>
          <option value="CO">Como</option>
          <option value="CR">Cremona</option>
          <option value="CS">Cosenza</option>
          <option value="CT">Catania</option>
          <option value="CZ">Catanzaro</option>
          <option value="EN">Enna</option>
          <option value="FC">Forlì-Cesena</option>
          <option value="FE">Ferrara</option>
          <option value="FG">Foggia</option>
          <option value="FI">Florence</option>
          <option value="FM">Fermo</option>
          <option value="FR">Frosinone</option>
          <option value="GE">Genoa</option>
          <option value="GO">Gorizia</option>
          <option value="GR">Grosseto</option>
          <option value="IM">Imperia</option>
          <option value="IS">Isernia</option>
          <option value="KR">Crotone</option>
          <option value="LC">Lecco</option>
          <option value="LE">Lecce</option>
          <option value="LI">Livorno</option>
          <option value="LO">Lodi</option>
          <option value="LT">Latina</option>
          <option value="LU">Lucca</option>
          <option value="MB">Monza and Brianza</option>
          <option value="MC">Macerata</option>
          <option value="ME">Messina</option>
          <option value="MI">Milan</option>
          <option value="MN">Mantua</option>
          <option value="MO">Modena</option>
          <option value="MS">Massa and Carrara</option>
          <option value="MT">Matera</option>
          <option value="NA">Naples</option>
          <option value="NO">Novara</option>
          <option value="NU">Nuoro</option>
          <option value="OG">Ogliastra</option>
          <option value="OR">Oristano</option>
          <option value="OT">Olbia-Tempio</option>
          <option value="PA">Palermo</option>
          <option value="PC">Piacenza</option>
          <option value="PD">Padua</option>
          <option value="PE">Pescara</option>
          <option value="PG">Perugia</option>
          <option value="PI">Pisa</option>
          <option value="PN">Pordenone</option>
          <option value="PO">Prato</option>
          <option value="PR">Parma</option>
          <option value="PT">Pistoia</option>
          <option value="PU">Pesaro and Urbino</option>
          <option value="PV">Pavia</option>
          <option value="PZ">Potenza</option>
          <option value="RA">Ravenna</option>
          <option value="RC">Reggio Calabria</option>
          <option value="RE">Reggio Emilia</option>
          <option value="RG">Ragusa</option>
          <option value="RI">Rieti</option>
          <option value="RM">Rome</option>
          <option value="RN">Rimini</option>
          <option value="RO">Rovigo</option>
          <option value="SA">Salerno</option>
          <option value="SI">Siena</option>
          <option value="SO">Sondrio</option>
          <option value="SP">La Spezia</option>
          <option value="SR">Syracuse</option>
          <option value="SS">Sassari</option>
          <option value="SV">Savona</option>
          <option value="TA">Taranto</option>
          <option value="TE">Teramo</option>
          <option value="TN">Trento</option>
          <option value="TO">Turin</option>
          <option value="TP">Trapani</option>
          <option value="TR">Terni</option>
          <option value="TS">Trieste</option>
          <option value="TV">Treviso</option>
          <option value="UD">Udine</option>
          <option value="VA">Varese</option>
          <option value="VB">Verbano-Cusio-Ossola</option>
          <option value="VC">Vercelli</option>
          <option value="VE">Venice</option>
          <option value="VI">Vicenza</option>
          <option value="VR">Verona</option>
          <option value="VS">Medio Campidano</option>
          <option value="VT">Viterbo</option>
          <option value="VV">Vibo Valentia</option>'
    @jpJapanese = '<option value="北海道">北海道</option>
                <option value="ACH">青森県</option>
                <option value="AKT">岩手県</option>
                <option value="AMR">宮城県</option>
                <option value="CHB">秋田県</option>
                <option value="EHM">山形県</option>
                <option value="FUK">福島県</option>
                <option value="FKK">茨城県</option>
                <option value="FKS">栃木県</option>
                <option value="GIF">群馬県</option>
                <option value="GUM">埼玉県</option>
                <option value="HRS">千葉県</option>
                <option value="HKD">東京都</option>
                <option value="HYG">神奈川県</option>
                <option value="IBR">新潟県</option>
                <option value="ISK">富山県</option>
                <option value="IWT">石川県</option>
                <option value="KGW">福井県</option>
                <option value="KGS">山梨県</option>
                <option value="KNG">長野県</option>
                <option value="KOC">岐阜県</option>
                <option value="KMM">静岡県</option>
                <option value="KYT">愛知県</option>
                <option value="MIE">三重県</option>
                <option value="MYG">滋賀県</option>
                <option value="MYZ">京都府</option>
                <option value="NGN">大阪府</option>
                <option value="NGS">兵庫県</option>
                <option value="NAR">奈良県</option>
                <option value="NGT">和歌山県</option>
                <option value="OIT">鳥取県</option>
                <option value="OKY">島根県</option>
                <option value="OKN">岡山県</option>
                <option value="OSK">広島県</option>
                <option value="SAG">山口県</option>
                <option value="STM">徳島県</option>
                <option value="SHG">香川県</option>
                <option value="SMN">愛媛県</option>
                <option value="SZO">高知県</option>
                <option value="TCG">福岡県</option>
                <option value="TKS">佐賀県</option>
                <option value="TOK">長崎県</option>
                <option value="TGR">熊本県</option>
                <option value="TYM">大分県</option>
                <option value="WKY">宮崎県</option>
                <option value="YMT">鹿児島県</option>
                <option value="YMG">沖縄県</option>'
    @jp = '<option value="ACH">Aichi</option>
          <option value="AKT">Akita</option>
          <option value="AMR">Aomori</option>
          <option value="CHB">Chiba</option>
          <option value="EHM">Ehime</option>
          <option value="FUK">Fukui</option>
          <option value="FKK">Fukuoka</option>
          <option value="FKS">Fukushima</option>
          <option value="GIF">Gifu</option>
          <option value="GUM">Gunma</option>
          <option value="HRS">Hiroshima</option>
          <option value="HKD">Hokkaido</option>
          <option value="HYG">Hyogo</option>
          <option value="IBR">Ibaraki</option>
          <option value="ISK">Ishikawa</option>
          <option value="IWT">Iwate</option>
          <option value="KGW">Kagawa</option>
          <option value="KGS">Kagoshima</option>
          <option value="KNG">Kanagawa</option>
          <option value="KOC">Kochi</option>
          <option value="KMM">Kumamoto</option>
          <option value="KYT">Kyoto</option>
          <option value="MIE">Mie</option>
          <option value="MYG">Miyagi</option>
          <option value="MYZ">Miyazaki</option>
          <option value="NGN">Nagano</option>
          <option value="NGS">Nagasaki</option>
          <option value="NAR">Nara</option>
          <option value="NGT">Niigata</option>
          <option value="OIT">Oita</option>
          <option value="OKY">Okayama</option>
          <option value="OKN">Okinawa</option>
          <option value="OSK">Osaka</option>
          <option value="SAG">Saga</option>
          <option value="STM">Saitama</option>
          <option value="SHG">Shiga</option>
          <option value="SMN">Shimane</option>
          <option value="SZO">Shizuoka</option>
          <option value="TCG">Tochigi</option>
          <option value="TKS">Tokushima</option>
          <option value="TOK">Tokyo</option>
          <option value="TGR">Tottori</option>
          <option value="TYM">Toyama</option>
          <option value="WKY">Wakayama</option>
          <option value="YMT">Yamagata</option>
          <option value="YMG">Yamaguchi</option>
          <option value="YMN">Yamanashi</option>'
    @us = '<option disabled selected value></option>
          <option value="AL">Alabama</option>
          <option value="AK">Alaska</option>
          <option value="AZ">Arizona</option>
          <option value="AR">Arkansas</option>
          <option value="CA">California</option>
          <option value="CO">Colorado</option>
          <option value="CT">Connecticut</option>
          <option value="DE">Delaware</option>
          <option value="DC">District of Columbia</option>
          <option value="FL">Florida</option>
          <option value="GA">Georgia</option>
          <option value="GU">Guam</option>
          <option value="HI">Hawaii</option>
          <option value="ID">Idaho</option>
          <option value="IL">Illinois</option>
          <option value="IN">Indiana</option>
          <option value="IA">Iowa</option>
          <option value="KS">Kansas</option>
          <option value="KY">Kentucky</option>
          <option value="LA">Louisiana</option>
          <option value="ME">Maine</option>
          <option value="MD">Maryland</option>
          <option value="MA">Massachusetts</option>
          <option value="MI">Michigan</option>
          <option value="MN">Minnesota</option>
          <option value="MS">Mississippi</option>
          <option value="MO">Missouri</option>
          <option value="MT">Montana</option>
          <option value="NE">Nebraska</option>
          <option value="NV">Nevada</option>
          <option value="NH">New Hampshire</option>
          <option value="NJ">New Jersey</option>
          <option value="NM">New Mexico</option>
          <option value="NY">New York</option>
          <option value="NC">North Carolina</option>
          <option value="ND">North Dakota</option>
          <option value="OH">Ohio</option>
          <option value="OK">Oklahoma</option>
          <option value="OR">Oregon</option>
          <option value="PA">Pennsylvania</option>
          <option value="PR">Puerto Rico</option>
          <option value="RI">Rhode Island</option>
          <option value="SC">South Carolina</option>
          <option value="SD">South Dakota</option>
          <option value="TN">Tennessee</option>
          <option value="TX">Texas</option>
          <option value="VI">US Virgin Islands</option>
          <option value="UT">Utah</option>
          <option value="VT">Vermont</option>
          <option value="VA">Virginia</option>
          <option value="WA">Washington</option>
          <option value="WV">West Virginia</option>
          <option value="WI">Wisconsin</option>
          <option value="WY">Wyoming</option>'
    @za = '<option value="EC">Eastern Cape</option>
          <option value="FS">Free State</option>
          <option value="GT">Gauteng</option>
          <option value="NL">KwaZulu-Natal</option>
          <option value="LP">Limpopo</option>
          <option value="MP">Mpumalanga</option>
          <option value="NC">Northern Cape</option>
          <option value="NW">North West</option>
          <option value="WC">Western Cape</option>'

  disable: () ->
    return this if !@isEnabled
    @isEnabled = false

    @$countrySelect.off 'change', @onSelectChangeHandler
    @$registerBtn.off 'click', @onRegisterBtnClickHandler
    @$registerModal.off 'click', @onModalClickHandler
    @$registerModal.children().off 'click', @onModalChildrenClickHandler
    @$modalCloseBtn.off 'click', @onModalClickHandler
    @$registerForm.off 'submit', @onSubmitHandler
    @$formSuccessBtn.off 'click', @onSuccessClickHander
    @$emailField.off 'blur', @onEmailBlurHandler
    this

  enable: () ->
    return this if @isEnabled
    @isEnabled = true

    selectedCountry = @$countrySelect.val().toLowerCase()
    targetVal = @[selectedCountry]
    @$stateSelect.empty().append(targetVal)

    @$countrySelect.on 'change', @onSelectChangeHandler
    @$registerForm.on 'submit', @onSubmitHandler
    @$formSuccessBtn.on 'click', @onSuccessClickHander
    @$emailField.on 'blur', @onEmailBlurHandler
    if @$registerForm.hasClass('js-register-form')
      @$formInputs.on 'click', @onInputClickHandler
      @$registerBtn.on 'click', @onRegisterBtnClickHandler
      @$modalCloseBtn.on 'click', @onModalClickHandler
    else if @$registerForm.hasClass('js-register-form-abridged')
      @$formInputs.on 'click', @onInputClickHandler
    else
      @$registerModal.on 'click', @onModalClickHandler
      @$registerModal.children().on 'click', @onModalChildrenClickHandler

    this

  createChildren: () ->
    @$countrySelect = @$registerForm.find('#00Ni000000FlJ6K')
    @$stateSelect = @$registerForm.find('.js-state-field')
    @$emailField = @$registerForm.find('#email')
    @$registerBtn = $('.js-register-btn')
    @$registerSubmit = @$registerForm.find('.js-register-submit')
    @$registerModal = $('.js-register-modal')
    @$registerFormWrapper = $('.js-register-form-wrapper')
    @$formInputs = @$registerForm.find('input')
    @$modalInner = @$registerModal.find('.js-modal-inner')
    @$modalCloseBtn = @$registerModal.find('.js-register-modal-close')
    @$formSuccess = $('.js-form-success')
    @$formSuccessBtn = @$formSuccess.find('.js-success-btn')
    @$hideEls = $('.js-hide')
    @body = document.body

    this

  addEventHandlers: () ->
    @onSelectChangeHandler = @onSelectChange.bind @
    @onRegisterBtnClickHandler = @onRegisterBtnClick.bind @
    @onModalClickHandler = @onModalClick.bind @, true
    @onModalChildrenClickHandler = @onModalClick.bind @, false
    @onSubmitHandler = @onSubmit.bind @
    @submitSuccessHandler = @submitSuccess.bind @
    @onSuccessClickHander = @onSuccessClick.bind @
    @onInputClickHandler = @onInputClick.bind @
    @onEmailBlurHandler = @onEmailBlur.bind @

    this

  mapErrorResponses: () ->
    @requiredFields = ['first_name', 'last_name', 'email', 'street', 'city', @countryField, @stateField, 'zip', @langField, @whereField ]
    @abridgedRequiredFields = ['first_name', 'last_name', 'email', @countryField, @stateField]

    @errorResponses =
      'first_name'        : @requiredField.bind @
      'last_name'         : @requiredField.bind @
      'email'             : @emailField.bind @
      'street'            : @requiredField.bind @
      'city'              : @requiredField.bind @
      "#{@countryField}"  : @requiredField.bind @
      "#{@stateField}"    : @requiredField.bind @
      'zip'               : @requiredField.bind @
      "#{@langField}"     : @requiredField.bind @
      "#{@whereField}"    : @requiredField.bind @

    this

  emailField: (field, value) ->
    errorMsg = if $('body').hasClass('jp') then "Eメールアドレスを入力してください" else "must be an email address."
    re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    isValid = re.test(value)
    if !isValid
      @createError(field, errorMsg)

    return isValid

  createError: (element, message) ->
    $parentEl = @$registerForm.find("##{element}").parent().parent()
    $parentEl.append($("<p class='register-form__error'>#{message}</p>"))
    @$errorEl = $('.register-form__error')

    this

  parsePageName: () ->
    splitted = WardVillage.currentPage.split('_')
    splitted.pop()
    sub = splitted.join(' ')
    sub = if sub.charAt(sub.length - 1) == 's' then sub.substring(0, sub.length - 1) else sub
    "#{sub.charAt(0).toUpperCase()}#{sub.slice(1)}"

  marketPageId: () ->
    splitURL = document.URL.split('/').pop()

  requiredField: (field, value) ->
    errorMsg = if $('body').hasClass('jp') then "必ずご記入ください" else "field can't be blank."

    if value == "" || value == null
      @createError(field, errorMsg)
      return false
    else
      return true


  onEmailBlur: (e) ->
    @hashedEmail = md5 @$emailField.val()
    window._sdi.salesforceData = @hashedEmail
    window.hashed_email = @hashedEmail
    this

  onInputClick: (e) ->
    mappingVal = if @isModal then 'overlay' else WardVillage.currentPage
    label = if WardVillage.currentPage == 'marketing_pages_show' then "#{GA_LABEL_MAPPING[mappingVal]} [#{@marketPageId()}]"
    else GA_LABEL_MAPPING[mappingVal]
    ga('send', 'event', 'Interest Form', 'Start', label)
    @$formInputs.off 'click', @onInputClickHandler
    this

  onSubmit: (e) ->
    e.preventDefault()

    if @$errorEl
      @$errorEl.remove()
      @$errorEl = null

    # Controlling brokerField targeting based on inline vs modal form and checkbox ID
    # see _form_wrapper.html.slim for alternative info
    brokerID = '00Ni000000HmD2I'
    brokerField = if @$registerForm.find("##{brokerID}").length == 0 then "#{brokerID}I" else brokerID

    ga 'send', 'event',
      eventCategory: 'Forms'
      eventAction: 'Submit'

    formData =
      'oid'              : @$registerForm.find("#oid").val()
      'retURL'           : @$registerForm.find("#retURL").val()
      'Campaign_ID'      : @$registerForm.find("#Campaign_ID").val()
      'lead_source'      : @$registerForm.find("#lead_source").val()
      'recordType'       : @$registerForm.find("#recordType").val()
      'member_status'    : @$registerForm.find("#member_status").val()
      'lang'             : @$registerForm.find("#lang").val()
      '00Ni000000GsQj4'  : @$registerForm.find('#00Ni000000GsQj4').val()
      '00Ni000000GsQjO'  : @$registerForm.find('#00Ni000000GsQjO').val()
      '00Ni000000GsQjJ'  : @$registerForm.find('#00Ni000000GsQjJ').val()
      '00Ni000000GsQjE'  : @$registerForm.find('#00Ni000000GsQjE').val()
      '00Ni000000GsQiz'  : @$registerForm.find('#00Ni000000GsQiz').val()
      '00Ni000000GsQjT'  : @$registerForm.find('#00Ni000000GsQjT').val()
      '00Ni000000GsQjY'  : @$registerForm.find('#00Ni000000GsQjY').val()
      'first_name'       : @$registerForm.find('#first_name').val()
      'last_name'        : @$registerForm.find('#last_name').val()
      'email'            : @$emailField.val()
      'phone'            : @$registerForm.find('#phone').val()
      'street'           : @$registerForm.find('#street').val()
      'city'             : @$registerForm.find('#city').val()
      "#{@countryField}" : @$registerForm.find("##{@countryField}").val()
      "#{@stateField}"   : @$registerForm.find("##{@stateField}").val()
      'zip'              : @$registerForm.find('#zip').val()
      "#{@langField}"    : @$registerForm.find("##{@langField}").val()
      "#{@whereField}"   : @$registerForm.find("##{@whereField}").val()
      "#{brokerID}"      : if @$registerForm.find("##{brokerField}").prop('checked') then 1 else 0
      '00Ni000000AfVlR'  : @$registerForm.find('#00Ni000000AfVlR').val()
      '00Ni000000IH2q6'  : @hashedEmail
      '00Ni000000IGWrM'  : 1

    isAbridgedForm = e.currentTarget.classList.contains('js-register-form-abridged')
    fields = if isAbridgedForm then @abridgedRequiredFields else @requiredFields

    # custom form validation. mostly for presence but finer ability is
    # easily attainable with this setup...
    i = 0
    j = fields.length
    isValid = true
    while i < j
      field = fields[i]
      tmpIsValid = @errorResponses[field](field, formData[field])
      isValid = tmpIsValid if !tmpIsValid
      i++

    reCaptcha = e.target.getElementsByClassName('g-recaptcha-response')[0]
    if reCaptcha && reCaptcha.value.length == 0
      isValid = false

    if !isValid
      @$errorEl.slideDown()
      if window.location.pathname == '/register'
        $('html, body').animate {
          scrollTop: @$errorEl.first().offset().top - 110
        }, 500
      return this

    #if form is valid, the submit button is disabled, so form can only be submitted once
    document.getElementById('submit-button').disabled = 'true'

    mappingVal = if @isModal then 'overlay' else WardVillage.currentPage
    label = if WardVillage.currentPage == 'marketing_pages_show' then "#{GA_LABEL_MAPPING[mappingVal]} [#{@marketPageId()}]"
    else GA_LABEL_MAPPING[mappingVal]
    ga('send', 'event', 'Interest Form', 'Complete', label)

    bingEv = if WardVillage.currentPage == 'residence_index' then 3 else 1
    bingTrackerRegister = window.uetq = window.uetq || []
    window.uetq.push({ 'ec':'Ward Village Register', 'ea':'Form submission', 'el':"Register Interest form submitted from campaign 701i0000000buRR", 'ev': [bingEv] })

    url = @$registerForm.attr('action')
    $.ajax
      url: url
      type: 'post'
      data: formData
      success: @submitSuccessHandler
      error: (jq, status, message) =>
        @submitSuccessHandler()

    this

  submitSuccess: (e) ->
    fbq('track', 'Lead');
    fadeOutTime = 250
    @$modalInner.fadeOut(fadeOutTime)
    @$hideEls.fadeOut fadeOutTime, =>
      @$formSuccess.fadeIn(300)
    # fbq('track', 'Lead');

    this

  onSelectChange: (e) ->
    selectedCountry = @$countrySelect.val().toLowerCase()

    # if $body.attr("id") is 'jp'
    #   jp = jpJapanese

    if @[selectedCountry]
      targetVal = @[selectedCountry]
    else
      targetVal = @empty
      @$stateSelect.attr('required', false)

    @$stateSelect.empty().append(targetVal)
    this

  onRegisterBtnClick: (e) ->
    e.preventDefault()
    return this if @body.classList.contains 'modal-open'
    ga('send', 'event', 'Interest Button', 'Click', @parsePageName())
    if WardVillage.currentPage != 'static_register'
      @isModal = true
      @$registerModal.addClass 'is-active'
      @body.classList.add 'modal-open'

    this

  onModalClick: (isParent, e) ->
    e.stopPropagation()

    if isParent
      @$registerModal.removeClass 'is-active'
      @body.classList.remove 'modal-open'
      @isModal = false

      if @$errorEl
        @$errorEl.remove()
        @$errorEl = null

    this

  onSuccessClick: (e) ->
    @$registerModal.removeClass 'is-active'
    @body.classList.remove 'modal-open'
    this

  init: () ->
    @createChildren()
      .mapErrorResponses()
      .addEventHandlers()
      .enable()
    this
