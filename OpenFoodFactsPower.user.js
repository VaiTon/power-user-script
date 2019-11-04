// ==UserScript==
// @name        Open Food Facts power user script
// @description Helps power users in their day to day work. Key "?" shows help. This extension is a kind of sandbox to experiment features that could be added to Open Food Facts website.
// @namespace   openfoodfacts.org
// @version     2019-11-04T09:33
// @include     https://*.openfoodfacts.org/*
// @include     https://*.openproductsfacts.org/*
// @include     https://*.openbeautyfacts.org/*
// @include     https://*.openpetfoodfacts.org/*
// @exclude     https://*.wiki.openfoodfacts.org/*
// @exclude     https://translate.openfoodfacts.org/*
// @exclude     https://donate.openfoodfacts.org/*
// @icon        http://world.openfoodfacts.org/favicon.ico
// @updateURL   https://github.com/openfoodfacts/power-user-script/raw/master/OpenFoodFactsPower.user.js
// @grant       GM_getResourceText
// @require     http://code.jquery.com/jquery-latest.min.js
// @require     http://code.jquery.com/ui/1.12.1/jquery-ui.min.js
// @require     https://cdn.jsdelivr.net/jsbarcode/3.6.0/JsBarcode.all.min.js
// @require     https://cdn.jsdelivr.net/npm/wheelzoom
// @author      charles@openfoodfacts.org
// ==/UserScript==

(function() {
    'use strict';
    const pageType = isPageType(); // test page type
    console.log("2019-11-04T09:33 - mode: " + pageType);

    // Disable extension if the page is an API result; https://world.openfoodfacts.org/api/v0/product/3222471092705.json
    if (pageType === "api") {
        // TODO: allow keyboard shortcut to get back to product view?
        var _code = window.location.href.match(/\/product\/(.*)\.json$/)[1];
        var viewURL = document.location.protocol + "//" + document.location.host + "/product/" + _code;
        console.log('press v to get back to product view: ' + viewURL);
        $(document).on('keydown', function(event) {
             if (event.key === 'v') {
                 window.open(viewURL, "_blank"); // open a new window
                 return;
             };
        });
        return;
    }

    // Setup options
    var zoomOption        = false; // "true" allows zooming images with mouse wheel, while "false" disallow it
    var listByRowsOption  = false; // "true" automatically lists products by rows, while "false" not

    // Open Food Facts power user
    // * Main code by Charles Nepote (@CharlesNepote)
    // * Barcode code by @harragastudios

    // Firefox: add it via Greamonkey or Tampermonkey extension: https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/
    // Chrome (not tested): add it with Tampermonkey: https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo

    // Main features
    // * DESIGN (custom CSS with small improvements)
    //   * barcode highlighted with a sweet color
    //   * better distinguished sections
    //   * fields highlighted, current field highlighted
    //   * less margins for some elements
    //   * number of products easier to read (with separators depending on your locale); see: https://github.com/openfoodfacts/openfoodfacts-server/issues/2474
    // * UI
    //   * help screen called with button [?] or keyboard shortcut (?) or (h)
    //   * zoom every images with mouse wheel; see http://www.jacklmoore.com/zoom/
    //   * show/hide barcode; keyboard shortcut (shift+B)
    //     * see https://github.com/openfoodfacts/openfoodfacts-server/issues/1728
    //   * keyboard shortcut to API product page (alt+shift+A)
    //   * keyboard shortcut to get back to view mode (v)
    //   * keyboard shortcut to enter edit mode: (e) in the current window, (E) in a new window
    //     * see Add "Edit" keyboard shortcut for logged users: https://github.com/openfoodfacts/openfoodfacts-server/issues/1852
    //   * keyboard shortcuts to help modify data without a mouse: P(roduct), Q(uality), B(rands), C(ategories), L(abels), I(ngredients), (e)N(ergy), F(ibers)
    //   * dedicated to list screens (facets, search results...):
    //     * [alpha] keyboard shortcut to list products as a table containing ingredients and options to edit or delete ingredients
    //               (shift+L) ["L" for "list"]
    //               The LanguageTool Firefox extension is recommanded because it detects automatically the language of each field.
    //               https://addons.mozilla.org/en-US/firefox/addon/languagetool/
    // * FEATURES
    //   * [beta] transfer data from a language to another (use *very* carefully); keyboard shortcut (shift+T)
    //   * [beta] easily delete ingredients, by entering the list by rows mode (shift+L)
    //   * [alpha] allow flagging products for later review (shift+S)
    //     * https://github.com/openfoodfacts/openfoodfacts-server/issues/1408
    //     * Ask charles@openfoodfacts.org
    //   * launch Google OCR if "Edit ingredients" is clicked in view mode
    //   * "[Products without brand that might be from this brand]" link, following product code
    //   * help screen: add "Similarly named products without a category" link
    //   * help screen: add "Product code search on Google" link
    //   * help screen: add links to Google/Yandex Reverse Image search (thanks Tacite for suggestion)
    //   * Add fiew informations on the confirmation page:
    //     * Products issues:
    //       * To be completed (from "states_tags")
    //       * Quality tags
    //       * and a link to product edit
    //     * Going further
    //       * "XX products without brand that might be from this brand" link

    // * DEPLOYMENT
    //   * Tampermonkey suggest to update the extension when one click to updateURL:
    //     https://gist.github.com/CharlesNepote/f6c675dce53830757854141c7ba769fc/raw/OpenFoodFactsPowerUser.user.js


    // TODO
    // * FEATURES
    //   * Inline edit of ingredients in list mode
    //   * Add automatic detection of nutriments, see: https://robotoff.openfoodfacts.org/api/v1/predict/nutrient?ocr_url=https://static.openfoodfacts.org/images/products/841/037/511/0228/nutrition_pt.12.json
    //   * Easily delete ingredients when too buggy
    //   * list products with ingredients: allow inline editing
    //   * Add a shortcut to move a product to OBF, OPF
    //   * Add fiew informations on the confirmation page:
    //     * Nutri-Score and Nova if just calculated?
    //     * unknown ingredients
    //   * product of a brand from a particular country, that are not present in this country (see @teolemon)
    //   * keyboard shortcut to get back to view mode (v) => target=_self + prevent leaving page if changes are not saved
    //   * On the fly quality checks in the product edit form (javascript): https://github.com/openfoodfacts/openfoodfacts-server/issues/1905
    //   * Mass edit (?) -- see https://github.com/roiKosmic/OFFMassUpdate/blob/master/js/content_script.js
    // * UI & DESIGN
    //   * add a fixed menu button as in mass-updater
    //   * hightlight empty fields?
    //   * select high resolution images on demand
    // * BUGS
    //   * wheelzoom transform image links to: data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaH..................
    //   * some access keys doesnt seem to work, due to javascript library
    //     * see Support hitting the TAB key only once to quickly move to the next text field and then make entering text possible:
    //       https://github.com/openfoodfacts/openfoodfacts-server/issues/1245
    //   * focus on .tagsinput fields is not highlighted


    // css
    // See https://stackoverflow.com/questions/4376431/javascript-heredoc
    var css = `
/* .row { width: 80% !important; margin: 0 0 !important; } */

/* Special color for barcode */
span[property="food:code"] { color: Olive; }

/* Enhancements to better distinguish sections: Product information, Ingredients and Nutriments facts */
#main_column > div > h2 { margin-top: 1.6rem !important;
margin-bottom: 0.2rem !important;
border-bottom: 1px solid lightgrey; }

/* Special background color for all input fieds */
textarea, .tagsinput, input[type=text], input.nutriment_value { background-color: LightYellow !important; }
textarea:focus, .tagsinput:focus, input[type=text]:focus, input.nutriment_value:focus { background-color: lightblue !important; }

/* Small enhancements */
p { margin-bottom: 0.6rem !important; }

#image_box_front { margin-bottom: 1rem !important; }

.unselectbuttondiv_front_fr {
text-align: center !important; }

.unselectbutton_front_fr {
margin:0 0 0 0 !important;
}

/* Buttons Rotate left - Rotate right: 0.25rem vs 1.25 */
.cropbox > div > a { margin: 0 0 0.25rem; }

/* checkbox: Normalize colors and Photo on white background: try to remove the background */
.cropbox > label { margin-top: 3px; }
.cropbox > input { margin: 0 0 0.5rem 0; }

/* Reset margins of nutriments form */
input.nutriment_value { margin: 0 0 0 0; }

input.show_comparison {
margin: 0 0 0.2rem 0 !important;
}

}`;

    // apply custom CSS
    var s = document.createElement('style');
    s.type = 'text/css';
    s.innerHTML = css;
    document.documentElement.appendChild(s);

    if(pageType !== "list") {
        var code, barcode;
        code = getURLParam("code")||$('span[property="food:code"]').html();
        console.log("code: "+ code);
        // build API product link; example: https://world.openfoodfacts.org/api/v0/product/737628064502.json
        var apiProductURL = "/api/v0/product/" + code + ".json";
        console.log("API: " + apiProductURL);
        // build edit url
        var editURL = document.location.protocol + "//" + document.location.host + "/cgi/product.pl?type=edit&code=" + code;
    }


    // ***
    // * Image zoom
    // *
    // Test image zoom with mouse wheel
    // Don't forget to add: // @require     https://cdn.jsdelivr.net/npm/wheelzoom
    if(zoomOption) { wheelzoom(document.querySelectorAll('img')); } // doesn't work in edit mode

    // Test image zoom with jquery-zoom
    // Don't forget to add: // @require     https://cdn.jsdelivr.net/npm/jquery-zoom
    // $('img').zoom({ on:'grab' }); // add zoom // doesn't work
    // $('img').trigger('zoom.destroy'); // remove zoom


    // ***
    // * Edit mode
    // *
    // Accesskeys ; see https://stackoverflow.com/questions/5061353/how-to-create-a-keyboard-shortcut-for-an-input-button
    //    "P" could be for "Product characteristic" section (view mode: <h2>Product characteristics</h2> => <h2 id="product_characteristic">Product characteristics</h2> (not very useful) ; edit mode: <legend>Product characteristics</legend> => add the id)
    //    "P" could also be for the "product name" field (edit mode: id="product_name_fr" when fr)
    //    "Q" for "quantity"
    //    "B" for "brands"
    //    "C" for "categories" (very important field)
    //    "L" for "labels"
    //    "I" could be for "Ingredients" section (view mode: <h2>Ingredients</h2> => <h2 id="ingredients_section">Ingredients</h2> ; edit mode: <legend>Ingredients</legend> => add the id)
    //    "I" could also be for the "Ingredients" field (edit mode: id="ingredients_text_fr" when fr)
    //    "N" could be for "Nutrition facts" section (view mode: <h2>Nutrition facts</h2> => <h2 id="nutrition_facts_section">Nutrition facts</h2> ; edit mode: <legend>Nutrition facts</legend> => add the id)
    //    "N" could also be for the "Energy" field in edit mode (id="nutriment_energy")
    //    "F" for "Dietary fiber" (often not completed for historical reasons)
    if (pageType === "edit") {
        $("#product_name_fr").attr("accesskey","P");
        $("#quantity").attr("accesskey","Q");
        $("#brands_tagsinput").attr("accesskey","B");
        $("#categories_tagsinput").attr("accesskey","C");
        $("#labels_tagsinput").attr("accesskey","L");
        $("#ingredients_text_fr").attr("accesskey","I");
        $("#nutriment_energy").attr("accesskey","N");
        $("#nutriment_fiber").attr("accesskey","F");

        // TODO: add ingredients picture aside ingredients text area
        var ingredientsImage = $("#display_ingredients_es img");
        console.log("ingredientsImage: "+ ingredientsImage);
        $("#ingredients_text_es").after(ingredientsImage);
        $("#ingredients_text_es").css({
            "width": "50%",
            "float": "left",
        });
        // //$("#display_ingredients_es img").clone().after("#ingredients_text_es");
    }



    // ***
    // * View mode
    // *
    // Test if we are in a product view.
    if (pageType === "product view") {

        // If ingredients are allready entered, show results of the OCR
        if($("#editingredients")[0]) {
            // Looking for ingredients language
            var regex1 = new RegExp(/\((..)\)/);
            var ingredientsButton = $("#editingredients").html();
            //console.log($("#editingredients").html());
            var lc = regex1.exec(ingredientsButton)[1];
            console.log("Ingredients language: "+lc);

            // Show results of the OCR
            $('body').on('DOMNodeInserted', '#ingredients_list', function(e) {
                $(e.target).before( "<p>OCR results (not saved):</p>" );
                $(e.target).before( "<textarea id=\"ingredientFromGCV\"></textarea>" );
                getIngredientsFromGCV(code,lc);
                $(e.target).before( "<p>Text to be saved:</p>" );
            });
        }

    }


    // ***
    // * Saved product page
    // *
    var nbOfSameBrandProducts;
    if(pageType === "saved-product page") {
        $("#main_column").append('<p id="furthermore"><strong>Going further:</strong></p>' +
                                 '<ul id="going-further">' +
                                 '</ul>');
        $("#furthermore").before('<p id="product_issues"><strong>Product issues:</strong></p>' +
                                 '<ul id="issues" style="margin-bottom: 0.2rem">' +
                                 '</ul>');
        $("#issues").after('<p>→ <a href="'+editURL+'">Re-edit current product</a></p>');
        isNbOfSimilarNamedProductsWithoutACategory();
        addQualityTags();
        addStateTags();
    }


    // ***
    // * Every modes, except "api", "list", "search-form"
    // *
    if (pageType === "edit" ||
        pageType === "product view"||
        pageType === "saved-product page") {


        // (Find products from the same brand)
        if ($("#barcode_paragraph")) {
            var sameBrandProducts = code.replace(/[0-9][0-9][0-9][0-9]$/gi, "xxxx");
            var sameBrandProductsURL = document.location.protocol +
                "//" + document.location.host +
                '/state/brands-to-be-completed/code/' +
                sameBrandProducts;

            // https://fr.openfoodfacts.org/etat/marques-a-completer/code/506036745xxxx&json=1
            var sameBrandProductsJSON = sameBrandProductsURL + "&json=1";
            $.getJSON(sameBrandProductsJSON, function(data) {
                nbOfSameBrandProducts = data.count;
                console.log("nbOfSameBrandProducts: " + nbOfSameBrandProducts);
                $("#going-further").append('<li><span><a href="' +
                                     sameBrandProductsURL +
                                     '">' + nbOfSameBrandProducts +
                                     ' products without brand that might be from this brand</a></span>' +
                                     '</li>');
            });

            $("#barcode_paragraph")
                .append(' <span>[<a href="' +
                        sameBrandProductsURL +
                        '">Products without brand that might be from this brand</a>]</span>');
        }


        // TODO: compute Google and Yandex reverse image search
        var gReverseImageURL = "https://images.google.com/searchbyimage?image_url=";
        var yReverseImageURL = "https://yandex.com/images/search?source=collections&url=";
        var frontImgURL = $('meta[name="twitter:image"]').attr("content");
        var ingredientsImgURL = ($('#image_box_ingredients a img').attr('srcset') ? $('#image_box_ingredients a img').attr('srcset').match(/(.*) (.*)/)[1] : "");
        var nutritionImgURL = ($('#image_box_nutrition a img').attr('srcset') ? $('#image_box_nutrition a img').attr('srcset').match(/(.*) (.*)/)[1] : "");
        //console.log('nutritionImgURL: ' + nutritionImgURL);


        // Help box
        var help = "<ul>" +
            "<li>(?) or (h): this present help</li>" +
            "<li>(Shift+b): show/hide <strong>barcode</strong></li>" +
            "<hr>" +
            "<li>(e): edit current product in current window</li>" +
            "<li>(E): edit product in a new window</li>" +
            "<li id='api_product_page'>(Alt+shift+A): API product page (json)</li>" +
            "<li><a href='"+ sameBrandProductsURL + "'>" + sameBrandProducts + " products without a brand</a></li>" +
            (pageType === "product view" ?
               "<li><a href=\""+ getSimilarlyNamedProductsWithoutCategorySearchURL() + "\">Similarly named products without a category</a></li>":
               "<li>Similarly named products without a category (view mode only)</li>") +
            "<li><a href='https://google.com/search?&q="+ code + "'>Product code search on Google</a></li>" +
            "<li>Google Reverse Image search: "+
               (pageType !== "product view" ? "(view mode only)</li>" :
                  (frontImgURL ? "<a href='"+ gReverseImageURL + frontImgURL + "'>front</a>" : "")+
                  (ingredientsImgURL ? ", <a href='"+ gReverseImageURL + ingredientsImgURL + "'>ingredients</a>" : "") +
                  (nutritionImgURL ? ", <a href='"+ gReverseImageURL + nutritionImgURL + "'>nutrition</a>" : "")) +
            "</li>" +
            "<li>Yandex Reverse Image search: "+
               (pageType !== "product view" ? "(view mode only)</li>" :
                  (frontImgURL ? "<a href='"+ yReverseImageURL + frontImgURL + "'>front</a>" : "")+
                  (ingredientsImgURL ? ", <a href='"+ yReverseImageURL + ingredientsImgURL + "'>ingredients</a>" : "") +
                  (nutritionImgURL ? ", <a href='"+ yReverseImageURL + nutritionImgURL + "'>nutrition</a>" : "")) +
            "</li>" +
            "<hr id='nav_keys'>" +
            "<li>(Alt+shift+key): direct access to (P)roduct name, (Q)uality, (B)rands, (C)ategories, (L)abels, (I)ngredients, e(N)ergy, (F)ibers</li>" +
            "<hr>" +
            "<li>(shift+T): <strong>transfer</strong> a product from a language to another, in edition mode only (use <strong>very</strong> carefully)</li>" +
            "<li>(shift+S): <strong>flag</strong> product for later review (ask charles@openfoodfacts.org for log access)</li>" +
            "</ul>";

        // Help icon fixed
        $('body').append('<button id="pwe_help" style="position:fixed; left:50%;top:0rem;padding:0 1rem 0 1rem;font-size:1.5rem;background-color:red;">?</button>');
        //$('#select_country_li').insertAfter('<li id="pwe_help" style="font-size:2rem;background-color:red;">?</li>'); // issue: menu desappear when scrolling
        $("#pwe_help").click(function(){
            showPowerUserInfo(help); // open a new window
        });


        // API accesskey
        $('body').append('<a id="api-page" href="'+ apiProductURL +'" target="_blank"></a>');
        $("#api-page").attr("accesskey","A");

        // Keyboard actions
        $(document).on('keydown', function(event) {
            // console.log(event);
            // If the key is not pressed inside a input field (ex. search product field)
            if (!$(event.target).is(':input')) {
                // (Shift + B): toggle show/hide barcode
                if (event.key === 'B') {
                    if (barcode === true) {
                        $("#barcode_draw").remove();
                        barcode = false;
                        return;
                    }
                    if (barcode === false || barcode === undefined) {
                        $('<canvas id="barcode_draw"></svg>').insertAfter('#barcode');
                        barcode = true;
                        JsBarcode("#barcode_draw", code, {
                            lineColor: "Olive",
                            width: 2,
                            height: 50,
                            displayValue: true});
                        return;
                    }
                }
                // (e): edit current product in current window
                if (pageType === "product view" && event.key === 'e') {
                    window.open(editURL, "_self"); // edit in current window
                    return;
                }
                // (E): edit current product in a new window
                if (pageType === "product view" && event.key === 'E') {
                    window.open(editURL); // open a new window
                    return;
                }
                // (v): if in "edit" mode, switch to view mode
                if (pageType !== "product view" && event.key === 'v') {
                    var viewURL = document.location.protocol + "//" + document.location.host + "/product/" + code;
                    window.open(viewURL, "_blank"); // open a new window
                    return;
                }
                // (?): edit current product in a new window
                if (event.key === '?' || event.key === 'h') {
                    showPowerUserInfo(help); // open a new window
                    return;
                }
                // (S): edit current product in a new window
                if (event.key === 'S' && getURLParam("rev")) {
                    flagThisVersion();
                    return;
                }
                // (T): transfer a product from a language to another
                if (event.key === 'T') {
                    if (pageType !== "edit") {
                        showPowerUserInfo('<p>Transfer only work in "edit" mode.</p>');
                        return;
                    }
                    // products to test: https://es-en.openfoodfacts.org/language/en:1/language/french
                    // https://europe-west1-openfoodfacts-1148.cloudfunctions.net/openfoodfacts-language-change?ol=fr&fl=es&code=7622210829580
                    // TODO: use detectLanguages() function
                    var array_langs = $("#sorted_langs").val().split(",");
                    var options_langs;
                    var transferServiceURL = "https://europe-west1-openfoodfacts-1148.cloudfunctions.net/openfoodfacts-language-change";
                    $.each(array_langs,function(i){
                        options_langs += '<option value="'+(array_langs[i])+'">'+(array_langs[i])+'</option>';
                    });
                    console.log("options_langs: "+options_langs);
                    var transfer = "<div id=\"dialog\" title=\"Dialog Form\">" +
                        '<form action="' + transferServiceURL + '" method="get">' +
                        "<label>Source language:</label>" +
                        "<select id=\"transfer_ol\" name=\"ol\">" +
                        options_langs +
                        "</select>" +
                        "<label>Target language:</label>" +
                        "<input id=\"transfer_fl\" name=\"fl\" type=\"text\">" +
                        "<input type=\"hidden\" name=\"code\" value=\""+ code + "\">" +
                        "<input id=\"transfer_submit\" type=\"button\" value=\"=> Transfer\">" +
                        "</form>" +
                        '<div id="transfer_result"></div>' +
                        "</div>";
                    showPowerUserInfo(transfer); // open a new window
                    $("#transfer_submit").click(function(){
                        var url = transferServiceURL +
                            "?ol=" + $("#transfer_ol").val() +
                            "&fl=" + $("#transfer_fl").val() +
                            "&code=" + code;
                        console.log(url);
                        $.ajax({url: url, success: function(result){
                            $("#transfer_result").html(result);
                        }});
                        $("#transfer_result").html("<p>Page is going to reload in 5s...</p>");
                        setTimeout(function() {
                            location.reload(); // reload the page
                        }, 8000);
                    });
                    return;
                }
            }

        });
    }




    // ***
    // * "list" mode (when a page contains a list of products (home page, facets, search results...)
    // *
    if (pageType === "list") {
        var css_4_list =`
/*  */
#main_column              { height:auto !important; } /* Because main_column has an inline style with "height: 1220px" */
.products                 { /*display: table; /**/ border-collapse: collapse; /*float:none;/**/ }
.products li              { display: table-row;  width: auto;    text-align: left; border: 1px solid black; float:none;  }

 .products > li > a,
 .products > li > a > div,
 .products > li > a > span,
 .ingr,
 .p_actions { display: table-cell; }

 .products > li > a { border: 1px solid black; }
 .ingr, .p_actions { border: 0px solid black;/**/ }
 .ingr { border-right: 0px; } .p_actions {border-left: 0px; }

 .products > li > a        { display: table-cell; width:   30%;  vertical-align: middle; height: 6rem !important; }
 .products > li > a > div  { display: table-cell; max-width:   35% !important; } /* */
 .products > li > a > span { display: table-cell; width:   70%;  vertical-align: middle; padding-left: 1rem;} /* */

 .wrap_ingr                { width: 70% !important; position: relative; }
 .ingr                     { display: table-cell; /*width: 800px;/**/ height:8rem; margin: 0; vertical-align: middle; padding: 0 0.6rem 0 0.6rem;}
 .p_actions                 { display: table-cell; width: 100px;  vertical-align: middle; padding: 0.5rem; line-height: 2.6rem !important; width: 4rem !important; }
 .ingr, .p_actions > button { font-size: 0.9rem; vertical-align: middle; }
 .p_actions > button { margin: 0 0 0 0; padding: 0.3rem 0.1rem 0.3rem 0.1rem; width: 6rem; }
 .ingr_del { background-color: #ff2c2c; }
._lang { position: absolute; top:3rem; right:16px; font-size:3rem; opacity:0.4; }

#timed_alert { position:fixed; top:0; right:0; font-size: 8rem }

`;
        // Show an easier to read number of products
        /*
        var xxxProducts = $(".button-group li div").text(); console.log(xxxProducts); // 1009326 products
        var nbOfProducts = parseInt(xxxProducts.match(/(\d+)/g)[0]); //console.log(nbOfProducts); // 1009326
        nbOfProducts = nbOfProducts.toLocaleString(); //console.log(nbOfProducts); // 1 009 326
        $(".button-group li div").text(xxxProducts.replace(/(\d+)(.*)/, nbOfProducts+"$2")); // 1 009 326 products /**/

        
        var listByRowsMode = false; // We are not yet in "list by rows" mode
        // Keyboard actions
        if (listByRowsOption === true) { listByRows(); }
        $(document).on('keydown', function(event) {
            // If the key is not pressed inside a input field (ex. search product field)
            if (!$(event.target).is(':input')) {
                // (Shift + L)
                if (event.key === 'L' && listByRowsMode === false) {
                    listByRows();

                }
            }

        });

    }





    /***
     * listByRows
     *
     */
    function listByRows() {
        console.log("List by rows -------------");
        listByRowsMode = true;
        console.log("listByRowsMode: " + listByRowsMode);
        var s = document.createElement('style');
        s.type = 'text/css';
        s.innerHTML = css_4_list;
        document.documentElement.appendChild(s);

        var urlList = document.URL;
        var prods = getJSONList(urlList);
        //console.log(prods);

        $(".off").hide();
        $(".app").hide();
        $(".project").hide();
        $(".community").hide();
    }



    /***
     *
     * @param   : var, url of the list; example: https://world.openfoodfacts.org/cgi/search.pl?search_terms=banania&search_simple=1
     * @return  : object, JSON list of products
     */
    function getJSONList(urlList) {
        // Test URLs:
        // https://world.dev.openfoodfacts.org/quality/ingredients-100-percent-unknown
        // https://fr.openfoodfacts.org/quality/ingredients-100-percent-unknown/quality/ingredients-ingredient-tag-length-greater-than-50/200 (
        var ingr = "";
        $.getJSON( urlList + "&json=1", function(data) {
            console.log("Data from products' page: " + urlList);
            console.log(data);
            var local_code, editIngUrl;
            $( ".products > li" ).each(function( index ) {
                //console.log( index + ": " + $( this ).text() );
                //$( this ).find(">:first-child").append('<span class="ingr">'+data["products"][index]["ingredients_text"]+'</span>');
                local_code = data["products"][index]["code"];
                var _lang = data["products"][index]["lang"];
                editIngUrl = document.location.protocol + "//" + document.location.host +
                             '/cgi/product.pl?type=edit&code=' + local_code + '#tabs_ingredients_image';
                // Add ingredients form
                // Note: we added lang="xx" to let browsers spellcheck contents of each form depending
                //       on the language. But it seems complicated, see:
                //       TODO: https://stackoverflow.com/questions/41252737/over-ride-chrome-browser-spell-check-language-using-jquery-or-javascript
                //       https://bugs.chromium.org/p/chromium/issues/detail?id=389498 (It's a "won't fix" in Chrome)
                //       https://bugzilla.mozilla.org/show_bug.cgi?id=1073827#c33
                //       about:config in Firefox
                $("html").removeAttr("lang");
                $( this ).append('<div class="wrap_ingr">'+
                                 '<textarea class="ingr" id="i'+local_code+'" lang="'+_lang+'">'+
                                 data["products"][index]["ingredients_text"]+
                                 '</textarea>'+
                                 '<span class="_lang">'+ _lang +'</span>'+
                                 '</div>'
                                  );
                $( this ).append('<div  class="p_actions">'+
                                 '<button class="ingr_del" title="Immediate deletion, be careful." '+
                                 ' id="p_actions_del_'+local_code+'" value="'+local_code+'">'+
                                 'Delete'+
                                 '</button>'+
                                 '<button class="ingr_sav" title="Save this field." '+
                                 ' id="p_actions_sav_'+local_code+'" value="'+local_code+'">'+
                                 'Save'+
                                 '</button>'+
                                 "<button title=\"Edit in a new window\" "+
                                 "onclick=\"window.open('"+editIngUrl+"','_blank');\">"+
                                 'Edit [🡕]'+
                                 '</button>'+
                                 '</div>');
                $("#i"+local_code).attr('lang', _lang);
                // Edit ingredient field inline
                //$("#i"+local_code).dblclick(function() {
                //    console.log("dblclick on: "+$(this).attr("id"));
                //});
                $("#p_actions_sav_"+local_code).click(function(){
                    //saveProductField(productCode, field);
                    var _code = $(this).attr("value");
                    var _url = encodeURI(document.location.protocol + "//" + document.location.host +
                                         "/cgi/product_jqm2.pl?code=" + _code +
                                         "&ingredients_text_"+_lang+
                                         "=" + $("#i" + _code).val());
                    console.log(_url);
                    var _d = $.getJSON(_url, function() {
                        console.log("Save product ingredients");
                    })
                        .done(function(jqm2) {
                            console.log(jqm2["status_verbose"]);
                            console.log(jqm2);
                        })
                        .fail(function() {
                            console.log("fail");
                        });
                            $("body").append('<div id="timed_alert">Saved!</div>');
                            $("#timed_alert").fadeOut(3000, function () { $(this).remove(); });
                });
                // Delete ingredients field: https://world.openfoodfacts.net/cgi/product_jqm2.pl?code=0048151623426&ingredients_text=
                $("#p_actions_del_"+local_code).click(function(){
                    //deleteProductField(productCode, field);
                    var _code = $(this).attr("value");
                    var _url = document.location.protocol + "//" + document.location.host + "/cgi/product_jqm2.pl?code=" + _code + "&ingredients_text=";
                    console.log(_url);
                    var _d = $.getJSON(_url, function() {
                        console.log("Delete product ingredients");
                    })
                        .done(function(jqm2) {
                            console.log(jqm2["status_verbose"]);
                            console.log(jqm2);
                            $("#i"+_code).empty();
                        })
                        .fail(function() {
                            console.log("fail");
                        });
                });
            });
            return data;
        });
    }


    // ***
    // * Flag this version
    // *
    function flagThisVersion() {
        // Extract revision number from URL:
        // https://us.openfoodfacts.org/product/0744473477111/coconut-milk-non-dairy-frozen-dessert-vanilla-bean-so-delicious-dairy-free?rev=8
        var rev = getURLParam("rev");
        // Extract current user URL
        var user_url = $('a[href*="/cgi/user.pl?userid="]')[1];
        // Extract current user name from URL /cgi/user.pl?userid=charlesnepote&type=edit => charlesnepote
        var user_name = $(user_url).attr('href').match(/userid=(.*)&type/)[1];
        // Extract contributor of the current version from /contributor/jaeulitt => jaeulitt
        var version_user = $('.rev_contributor').attr('href').match(/contributor\/(.*)/)[1];
        console.log("user_url: "); console.log(user_url);
        console.log("user_name: "); console.log(user_name);
        console.log("version_user: "); console.log(version_user);
        //var session = $.cookie("session");
        //console.log("session: "+session);
        // https://script.google.com/macros/s/AKfycbwi9tIOPc7zh2NggDuq8geTSZqdZ470unBWUi4KV4AwYzCTNO8/exec?code=123&issue=fhkshf
        // Debug CORS: https://www.test-cors.org/
        // CORS proxies:
        //   * https://crossorigin.me/ => GET only
        //   * https://cors.io? => sometimes down (3 days after first tries); can be installed on Heroku
        //   * https://cors-anywhere.herokuapp.com/ => ok
        var googleScriptURL = "https://cors-anywhere.herokuapp.com/https://script.google.com/macros/s/AKfycbwi9tIOPc7zh2NggDuq8geTSZqdZ470unBWUi4KV4AwYzCTNO8/exec";
        var flagWindow =
            '<div id="flag_dialog" title="Dialog Form">' +
            '<form name="flag_form">' +
            '<label>Issue:</label>' +
            '<select id="flag_issue" name="issue">' +
            '<option value="ask_for_help">ask_for_help</option>' +
            '<option value="bug">bug</option>' +
            '<option value="copyright_(images...)">copyright_(images...)</option>' +
            '<option value="emblematic_product">emblematic_product</option>' +
            '<option value="error_to_explain">error_to_explain</option>' +
            '<option value="pro_account">pro_account</option>' +
            '<option value="to_be_completed">to_be_completed</option>' +
            '<option value="to_be_controlled">to_be_controlled</option>' +
            '<option value="to_be_finished">to_be_finished</option>' +
            '<option value="spam">spam</option>' +
            '<option value="user_to_be_contacted">user_to_be_contacted</option>' +
            '<option value="vandalism">vandalism</option>' +
            '</select>' +
            '<label>Comments (optionnal):</label>' +
            '<input name="comments" type="text" value="">' +
            //'<label>Description:</label>' +
            //'<input id="flag_desc" name="description" type="text">' +
            '<input type="hidden" name="admin_user" value="'+ user_name + '">' +
            '<input type="hidden" name="code" value="'+ code + '">' +
            '<input type="hidden" name="version_nb" value="'+ rev + '">' +
            '<input type="hidden" name="version_user" value="'+ version_user + '">' +
            '<input type="hidden" name="url" value="'+ document.location + '">' +
            '<input id="transfer_submit" type="submit" value="Flag this version">' +
            '</form>' +
            '<div id="flag_result"></div>' +
            '</div>';
        showPowerUserInfo(flagWindow); // open a new window
        var spreadsheetURL = 'https://docs.google.com/spreadsheets/d/1DE85Or0QiYwIXcG4vSVZyFSLMKvmJqOXM5ooJzxZr6Y/';

        const form = document.forms['flag_form'];
        console.log(form);
        form.addEventListener('submit', e => {
            console.log("Submited rev "+rev);
            e.preventDefault();
            fetch(googleScriptURL, {
                method: 'POST',
                mode: 'cors',
                body: new FormData(form)
            })
            .then(function(response) {
                console.log('Success!', response);
                $("#flag_result").append('<p style="margin-top:1rem;font-weight: bold;">' +
                                         '✅ Version ' +
                                         '<a href="' + spreadsheetURL + '" style="color:blue" target="_blank">' +
                                         'flagged</a>.</p>');
                return;})
            .catch(error => console.error('Error!', error.message));
        })
    }


    // * Add a flag button/API to put up a product for review when you're in a hurry: https://github.com/openfoodfacts/openfoodfacts-server/issues/1408
    //   * With Google Spreasheet, see: https://gist.github.com/mhawksey/1276293
    //   * https://mashe.hawksey.info/2014/07/google-sheets-as-a-database-insert-with-apps-script-using-postget-methods-with-ajax-example/
    //   * https://medium.com/@dmccoy/how-to-submit-an-html-form-to-google-sheets-without-google-forms-b833952cc175
    // Test: sendLoggingData("reporting_date=2019-06-14&admin_user=CharlesNepote&product_code="+code);
    // sendLoggingData("reporting_date=2019-06-14&admin_user=CharlesNepote&product_code="+code+"&callback=?");
    function sendLoggingData(serializedData) { // does not work!
        // https://api.jquery.com/jQuery.ajax/
        var request = $.ajax({
            //url: "https://script.google.com/macros/s/AKfycbxIWuMcXnysGTqR7JWtcOzb3usXtZQwMfp87SsiF7QL4dauQBGR/exec?issue=2019&code=CharlesNepote&callback=?",
            url: "https://cors.io?https://script.google.com/macros/s/AKfycbxIWuMcXnysGTqR7JWtcOzb3usXtZQwMfp87SsiF7QL4dauQBGR/exec",
            type: "GET",        // alias for 'method'
            crossDomain: true,
            dataType: "json",
            data: {
                issue: '2019',
                code: 'toto',
            }
        }).success(function() {
            // do something
            console.log("success1")
        });
        request.crossDomain = true;
        console.log("request: "+request);
    };


    // https://fr.openfoodfacts.org/etat/marques-a-completer/code/506036745xxxx&json=1
    function getNumberOfProductsWithSimilardCodeAndWithoutBrand(codeToCheck) {
        //

    }


    function addQualityTags() {
        $.getJSON(apiProductURL, function(data) {
            var qualityTagsArray = data.product.quality_tags;
            console.log("qualityTagsArray: ");
            console.log(qualityTagsArray);
            //var list = '<ul><li>' + arr.join('</li><li>') + '</li></ul>';
            var list = qualityTagsArray.join(' ◼ ');
            $("#issues").append('<li><span>Quality tags: ' + list +
                                    ' </span>' +
                                    '</li>');
        });
    }


    function addStateTags() { // TODO: merge with addQualityTags function?
        $.getJSON(apiProductURL, function(data) {
            var stateTagsArray = data.product.states_tags;
            console.log("stateTagsArray: ");
            console.log(stateTagsArray);
            //var list = '<ul><li>' + arr.join('</li><li>') + '</li></ul>';
            var filteredStateTagsArray = keepMatching(stateTagsArray, /(.*)to-be(.*)/);
            var finalArray = replaceInsideArray(filteredStateTagsArray, /en\:/, '');
            finalArray = replaceInsideArray(finalArray, /to-be-completed/, '');
            finalArray = replaceInsideArray(finalArray, /\-/g, ' ');
            console.log(finalArray);
            var list = stateTagsArray.join(' ◼ ');
            $("#issues").append('<li><span>To be completed (from "State tags"): ' + list +
                                    ' </span>' +
                                    '</li>');
        });
    }


    function isNbOfSimilarNamedProductsWithoutACategory() {
        var url = getSimilarlyNamedProductsWithoutCategorySearchURL();
        console.log("url: " + url);
        $.getJSON(url + "&json=1", function(data) {
                var nbOfSimilarNamedProductsWithoutACategory = data.count;
                console.log("nbOfSimilarNamedProductsWithoutACategory: " + nbOfSimilarNamedProductsWithoutACategory);
                $("#going-further").append('<li><span><a href="' +
                                     url +
                                     '">' + nbOfSimilarNamedProductsWithoutACategory +
                                     ' products with a similar name but without a category</a></span>' +
                                     '</li>');
        });
    }


    /**
     * Build search URL that finds products with a similar name, without category; example:
     * https://world.openfoodfacts.org/cgi/search.pl?search_terms=beef%20jerky&tagtype_0=states&tag_contains_0=contains&tag_0=categories%20to%20be%20completed&sort_by=unique_scans_n
     *
     * @returns {String} - Returns an URL
     */
    function getSimilarlyNamedProductsWithoutCategorySearchURL() {
        var productName, similarProductsSearchURL;
        if (pageType !== "product view") { // script fail if productName below is undefined
            return;
        }
        // The productName below sometimes is undefined; TODO: get it with API? https://world.openfoodfacts.org/api/v0/product/3222475464430.json&fields=product_name
        productName = $('h1[property="food:name"]').html().match(/(.*?)(( - .*)|$)/)[1];
        similarProductsSearchURL = encodeURI(
            document.location.protocol + "//" + document.location.host +
            "/cgi/search.pl?search_terms=" + productName +
            "&tagtype_0=states&tag_contains_0=contains&tag_0=categories to be completed&sort_by=unique_scans_n");
        console.log("productName: "+productName);
        console.log("similarProductsSearchURL: "+similarProductsSearchURL);
        return similarProductsSearchURL;
    }


    /**
     * Read a given URL parameter
     * https://stackoverflow.com/questions/19491336/get-url-parameter-jquery-or-how-to-get-query-string-values-in-js
     *
     * @param   {String} name - paramater name; ex. "code" in http://example.org/index?code=839370889
     * @returns {String} Return either null if param doesn't exist, either content of the param
     */
    function getURLParam(name) {
        var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
        if (results === null) {
            return null;
        }
        return decodeURI(results[1]) || 0;
    }


    /**
     * isPageType: Detects which kind of page has been loaded
     *
     * @returns  {String} - Type of page: api|saved-product page|edit|list|search form|product view
     */
    function isPageType() {
        // Detect API page. Example: https://world.openfoodfacts.org/api/v0/product/3599741003380.json
        var regex_api = RegExp('api/v0/');
        if(regex_api.test(document.URL) === true) {
            return "api";
        }
        // Detect "edit" mode.
        var regex = RegExp('product.pl');
        if(regex.test(document.URL) === true) {
            if (!$("#sorted_langs").length) { // Detect "Changes saved." page
                return "saved-product page";
            }
            else {
                return "edit";
            }
        }
        // Detect page containing a list of products (home page, search results...)
        if ($(".products")[0]) {
            return "list";
        }
        // Detect search form
        var regex_search = RegExp('cgi/search.pl$');
        if(regex_search.test(document.URL) === true) {
            return "search form";
        }
        // Finally, it's a product view
        if(regex.test(document.URL) !== true) {
            return "product view";
        }
    };


    /**
     * detectLanguages: detects which kind of page has been loaded
     *
     * @returns  {Array} - array of all languages available for a product; ex. ["de","fr","en"]
     */
    function detectLanguages() {
        console.log("detectLanguages: ");
        var array = $("#sorted_langs").val().split(",");
        console.log(array);
        return array;
    }


    // Show pop-up
    function showPowerUserInfo(message) {
        // Inspiration: http://christianelagace.com
        // create div for popup
        $('body').append('<div id="power-user-help" title="Information"></div>');
        $("#power-user-help").html(message);
        // transforme la division en popup
        var popup = $("#power-user-help").dialog({
            autoOpen: true,
            width: 400,
            dialogClass: 'dialogstyleperso',
        });
        // add style if necessarry
        //$("#power-user-help").prev().addClass('ui-state-information');
        return popup;
    }


    /**
     * getIngredientsFromGCV: Get ingredients via Google Cloud Vision
     *
     * @param    {String} code - product code; ex. 7613035748699
     * @param    {String} lc   - language; ex. "fr"
     */
    function getIngredientsFromGCV(code,lc) {
        // https://world.openfoodfacts.org/cgi/ingredients.pl?code=7613035748699&id=ingredients_fr&process_image=1&ocr_engine=google_cloud_vision
        var ingredientsURL = document.location.protocol + "//" + document.location.host +
                "/cgi/ingredients.pl?code=" + code +
                "&id=ingredients_" + lc + "&process_image=1&ocr_engine=google_cloud_vision";
        console.log("ingredientsURL: "+ingredientsURL);
        $.getJSON(ingredientsURL, function(json) {
            $("#ingredientFromGCV").append(json.ingredients_text_from_image);
        });
    };


    /**
     * keepMatching: keep only matching strings of an array
     * @example  finalArray = keepMatching(["tomatoes","eggs"], /eggs/);
     * // => ["eggs"]
     *
     * @param    {Array}  originalArray - array to check
     * @param    {String} regex         - regex pattern
     * @returns  {Array}                - new array
     */
    function keepMatching(originalArray, regex) {
        var j = 0;
        while (j < originalArray.length) {
            if (regex.test(originalArray[j]) === false) {
                originalArray.splice(j, 1); // delete value at position j
            } else {
                j++;
            }
        }
        return originalArray;
    }


    /**
     * replaceInsideArray: replace some content by another in each string of an array
     * @example  finalArray = replaceInsideArray(["en:tomatoes","en:eggs"], /en:/, '');
     * // => ["tomatoes","eggs"]
     *
     * @param    {Array}  originalArray - array to check
     * @param    {String} regex         - regex pattern
     * @param    {string} target        - target content
     * @returns  {Array}                - new array
     */
    function replaceInsideArray(originalArray, regex, target) {
        var j = 0;
        while (j < originalArray.length) {
            originalArray[j] = originalArray[j].replace(regex, target);
            if (originalArray[j] === "") {
                originalArray.splice(j, 1); // delete value at position j
            } else {
                j++;
            }
        }
        return originalArray;
    }

})();
