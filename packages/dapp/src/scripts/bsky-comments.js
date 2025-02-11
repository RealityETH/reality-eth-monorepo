/*
MIT License

Copyright (c) 2024 Nicholas Sideras

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

function addBskyComments(rootJQ, atProto, skipByDids) {

      console.log('get ', atProto, 'and try to add it to ', rootJQ);
      fetch(
        "https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?uri=" + atProto
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error, status = ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {

          rootJQ.find('.bsky-link-to-bsky').attr('href', ToBskyUrl(atProto));
          rootJQ.closest('.rcbrowser').addClass('bsky-active');
          rootJQ.closest('.rcbrowser').find('.bsky-link-to-bsky-upper').attr('href', ToBskyUrl(atProto));

          rootJQ.find('.show-hide-toggle').unbind('click').click(function(evt) {
            evt.stopPropagation();
            if (rootJQ.hasClass('comment-toggle-hide')) {
                rootJQ.removeClass('comment-toggle-hide').addClass('comment-toggle-show');
            } else {
                rootJQ.removeClass('comment-toggle-show').addClass('comment-toggle-hide');
            }
            return false;
          });

          const replies_to_show = flattenThread(data.thread, skipByDids);

          if (replies_to_show.length > 0) {
            rootJQ.find('.bsky-comment-count').text(replies_to_show.length);
            rootJQ.addClass('has-replies').removeClass('has-no-replies');
            const repliesContainer = rootJQ.find('.bsky-comments-body');
            for(let i=0; i<replies_to_show.length; i++) {
                const reply = replies_to_show[i];
                if (repliesContainer.find(`[data-bsky-comment-uri='${reply.post.uri}']`).length == 0) {
                    const icon = $('<img style="clip-path: circle()" class="tiny-icon" width="21px" height="21px" />');
                    icon.attr('data-did', reply.post.author.did);
                    icon.attr('src', reply.post.author.avatar);
                    rootJQ.find('.bsky-comment-icons').append(icon);
                    //const reply_html = renderComment(reply);
	            const reply_jq = populateComment($('.bsky-comment-template').contents().clone(), reply);
                    //repliesContainer.append($(reply_html));
                    repliesContainer.append(reply_jq);
                } else {
                   console.log('not adding reply, already added'); 
                }
            }
          } else {
            rootJQ.removeClass('has-replies').addClass('has-no-replies');
          }
          rootJQ.addClass('loaded');
        })
        .catch((error) => {
          console.log(`Could not load a bsky post for this question: ${error.message}`);
        });

        function ToBskyUrl(uri) {
            var splitUri = uri.split('/');
            if(splitUri[0] === 'at:')
            {
                return 'https://bsky.app/profile/' + splitUri[2] + '/post/' + splitUri[4];
            }
            else
            {
                return uri;
            }
        }


      function flattenThread(thread, skipByDids) {
          let replies_to_show = [];
          if (
            typeof thread.replies != "undefined" &&
            thread.replies.length > 0
          ) {
            for(let i=0; i<thread.replies.length; i++) {
                const reply = thread.replies[i];
                if (!reply) {
                    continue;
                }
                if (reply.post) {
                    if (!skipByDids.includes(reply.post.author.did)) {
			replies_to_show.push(reply);
                    }
                }
		if (reply.replies) {
		    replies_to_show = replies_to_show.concat(flattenThread(reply, skipByDids));
                }
            }
          }
          return replies_to_show;
      }

    function populateComment(comment_template, comment) {
      //console.log('comment', comment, comment_template);
      comment_template.attr('data-bsky-comment-uri', comment.post.uri);
      comment_template.find('.bsky-avatar-img').attr('src', comment.post.author.avatar);
      comment_template.find('.bsky-post-author-handle').attr('href', 'https://bsky.app/profile/' + comment.post.author.handle);
      comment_template.find('.bsky-post-author-handle').text('@' + comment.post.author.handle);
      comment_template.find('.bsky-post-display-name').text(comment.post.author.displayName);
      comment_template.find('.bsky-post-reply-datetime').text(new Date(comment.post.record.createdAt).toLocaleString());
      comment_template.find('.bsky-post-reply-datetime').attr('href', ToBskyUrl(comment.post.uri));
      comment_template.find('.bsky-post-record-text').text(comment.post.record.text);
      return comment_template;
    }

    function renderComment(comment) {
       var replyDate = new Date(comment.post.record.createdAt);
        return `
      <ul data-comment-uri="${comment.post.uri}" class="comment" style="display: flex; list-style: none; padding:0px; margin-bottom:0px;">
      <li style="margin-right: 10px;">
        <img src="${comment.post.author.avatar}" width="42px" height="42px" style="clip-path: circle()" />
      </li>
      <li>
        <div style="color:#757b82"><a href="https://bsky.app/profile/${comment.post.author.handle}" rel="ugc" style="color: #000; text-decoration: none;">
          <span class="display-name" style="white-space: nowrap;">${comment.post.author.displayName}</span>
          <span class="handle" style="white-space: nowrap;">@${comment.post.author.handle}</span>
          <span style="font-size:80%; white-space: nowrap;">${replyDate.toLocaleString()}</span>
        </a></div>
        <a href="${ToBskyUrl(comment.post.uri)}" rel="ugc" style="color: #000; text-decoration: none;">
        <div>${comment.post.record.text}</div>
      </li>
    </ul>`;
    }
}

export { 
    addBskyComments 
}
