'use strict';

export default function() {

    $(".main-nav a").click(function(e){
       $(".main-nav a").removeClass("selected");
       $(this).addClass("selected");
       $(".questions").hide();
       var selector = "#" + $(this).data("menu");
       $(selector).show();
       //alert($(this).data("menu"));
    });

    $(function() {
	$("#filter-list a").removeClass("selected");
	var category_name = window.location.hash.split("#!/category/")[1];
	if(category_name){
	    var selector = "[data-category=\""+category_name+"\"]";
	    $(selector).addClass("selected");
	} else {
	    $("[data-category=\"all\"]").addClass("selected");
	}
    });

};
