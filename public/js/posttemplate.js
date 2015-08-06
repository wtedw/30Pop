var compiledPost = _.template(
    "<div class='post row box'>" +
        "<div class='oc col-xs-12 col-sm-6 col-md-6 col-lg-6'>" +
            "<div class='well'>" +
                "<h2 class='postTitle text-center'><%- details.title %></h2>" +
                "<h5 class='postName <%- details.color %> text-center'><%- details.name %></h5>" +
                "<h5 class='postId text-center'><%- _id %></h5>" +
                "<img src='<%= details.link %>' class='center-block img-responsive post-image'>" +
            "</div>" +
    
            "<div class='well'>" +
                "<h3 class='text-center'><strong>Reply</strong></h3>" +
                "<form class='form-horizontal'>" +
                    "<div class='form-group title-group'>" +
                        "<label class='col-sm-2 control-label'>Title</label>" +
                        "<div class='col-sm-10'>" +
                          "<input class='form-control input-title' placeholder='Title'>" +
                        "</div>" +
                    "</div>" +

                    "<div class='form-group name-group'>" +
                        "<label class='col-sm-2 control-label'>Name</label>" +
                        "<div class='col-sm-10'>" +
                            "<input class='form-control input-name' placeholder='Name'>" +                   
                        "</div>" +
                    "</div>" +

                    "<div class='form-group link-group'>" +
                        "<label class='col-sm-2 control-label'>Img Link</label>" +
                        "<div class='col-sm-10'>" +
                            "<input class='form-control input-link' placeholder='Link'>" +                       
                        "</div>" +
                    "</div>" +
    
                    "<div class='form-group link-group'>" +
                        "<label class='col-sm-2 control-label'>Secret Code</label>" +
                        "<div class='col-sm-10'>" +
                            "<input class='form-control input-code' placeholder='(Optional) Only 90s kids will get this'>" +                       
                        "</div>" +
                    "</div>" +
    
                    "<div class='btn-group' role='group' aria-label='...'>" +
                        "<button class='btn btn-primary center-block push-button'>Push</button>" +
                        "<button class='btn btn-primary center-block pop-button'>Pop</button>" +
                    "</div>" +

                "</form>" +
            "</div>" +
        "</div>" +
        "<div class='comments col-xs-12 col-sm-6 col-md-6 col-lg-6'>" +
            "<h3 class='text-center comments-header'><strong>Comments</strong></h3>" +
        "</div>" +
    "</div>"
);

var compiledComment = _.template(
    "<div class='comment box'>" +
        "<h3 class='comment-title text-center'><%= details.title %></h2>" +     
        "<h5 class='comment-name <%- details.color %> text-center'><%= details.name %></h5>" +
        "<img src='<%= details.link %>' class='center-block img-responsive post-image'>" +
    "</div>"
)



        /* Comments
            "<div class='comment box'>" +
                "<h3 class='postTitle text-center'><%= comment3Title %></h2>" +     
                "<h5 class='postName text-center'><%= comment3Name %></h5>" +
                "<img src='<%= comment3Link %>' class='img-responsive'>" +

            "</div>" +
            "<div class='comment box'>" +
                "<h3 class='postTitle text-center'><%= comment2Title %></h2>" +     
                "<h5 class='postName text-center'><%= comment2Name %></h5>" +
                "<img src='<%= comment2Link %>' class='img-responsive'>" +
            "</div>" +
            "<div class='comment box '>" +
                "<h3 class='postTitle text-center'><%= comment1Title %></h2>" +     
                "<h5 class='postName text-center'><%= comment1Name %></h5>" +
                "<img src='<%= comment1Link %>' class='img-responsive'>" +
            "</div>" +
        */
