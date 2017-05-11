require('../../../node_modules/gsap/src/uncompressed/plugins/ScrollToPlugin.js');
import imagesLoaded from 'imagesloaded';
import interact from 'interact.js';
import Ps from 'perfect-scrollbar';
import {TweenLite, Power3} from 'gsap';
(function() {
    'use strict';

    // utility
    Object.defineProperties( Element.prototype, {
        hasClass: {
            value: function ( class_name ) {
                if ( this.classList ) {
                    return this.classList.contains( class_name );
                } else {
                    return new RegExp( '(^| )' + class_name + '( |$)', 'gi' ).test( this.className );
                }
            },
            enumerable: false,
            configurable: false,
            writable: false
        },
        addClass: {
            value: function ( class_name ) {
                if ( !this.hasClass( class_name ) ) {
                    if ( this.classList ) {
                        this.classList.add( class_name );
                    } else {
                        this.className += ' ' + class_name;
                    }
                }
            },
            enumerable: false,
            configurable: false,
            writable: false
        },
        removeClass: {
            value: function( class_name ) {
                var classes = this.className.split(' ');
                if (this.hasClass( class_name )) {
                    if (this.classList) {
                        this.classList.remove( class_name );
                    } else {
                        var existing_index = classes.indexOf( class_name );
                        classes.splice(existing_index, 1);
                        this.className = classes.join(' ');
                    }
                } else {
                    classes = null;
                }
            },
            enumerable: false,
            configurable: false,
            writable: false
        },
        toggleClass: {
            value: function( class_name ) {
                if (this.classList) {
                    this.classList.toggle( class_name );
                } else {
                    var classes = this.className.split(' ');
                    var existing_index = classes.indexOf( class_name );
                    if (existing_index >= 0) {
                        classes.splice(existing_index, 1);
                    } else {
                        classes.push( class_name );
                    }
                    this.className = classes.join(' ');
                }
            },
            enumerable: false,
            configurable: false,
            writable: false
        }
    });

    function rand(min, max) {
        return min + Math.floor(Math.random() * (max - min + 1));
    }

    var clickCounter = 9;
    var isFirstFocusBond = true;
    var isFirstErrorEditOption = true;
    var editOptionId = 0;
    const metamask = document.getElementById('fake-metamask');

    var bondUnit = 0;
    var _bondValue = 0;
    var bondValue = bondUnit + _bondValue;

    const monthList = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'June',
        'July',
        'Aug',
        'Sept',
        'Oct',
        'Nov',
        'Dec'
    ];

    // set rcBrowser height
    function rcbrowserHeight() {
        const rcbrowserHeaders  = document.querySelectorAll('.rcbrowser-header');
        const rcbrowserMains  = document.querySelectorAll('.rcbrowser-main');
        var _maxHeight = document.documentElement.clientHeight * .9;
        for (let i = 0, len = rcbrowserHeaders.length; i < len; i += 1) {
            let parent = rcbrowserHeaders[i].parentNode.parentNode;
            let parentRect = parent.getBoundingClientRect();
            let parentRectTop = parentRect.top;
            let maxHeight = _maxHeight - parentRectTop;
            let _headerHeight = rcbrowserHeaders[i].clientHeight;
            let _mainHeight = rcbrowserMains[i].clientHeight + 15;
            let _height = _headerHeight + _mainHeight;
            let height = Math.min(_height, maxHeight);
            parent.style.height = height + 'px';
        }
    }
    rcbrowserHeight();

    // initialize
    (function() {
        const answerItems = document.querySelectorAll('.answer-item');

        function clickHandler() {
            let answerData = this.querySelector('.answer-data');
            if (!this.hasClass('is-open')) {
                this.addClass('is-open');
                answerData.style.display = 'block';
                answerData.addClass('is-bounce');
            } else {
                this.removeClass('is-open');
                answerData.style.display = 'none';
                answerData.removeClass('is-bounce');
            }

            rcbrowserHeight();
        }

        for (let i = 0, len = answerItems.length; i < len; i += 1) {
            answerItems[i].addEventListener('click', clickHandler);
        }
    })();

    // set rcBrowser
    (function() {
        const items = document.querySelectorAll('.rcbrowser');
        const winWidth = document.documentElement.clientWidth;
        const winHeight = document.documentElement.clientHeight;
        const paddingTop = winHeight * 0.1;
        const paddingLeft = winWidth * 0.1;
        for (let i = 0, len = items.length; i < len; i += 1) {
            var itemWidth = Math.min(items[i].clientWidth, winWidth * 0.9);
            var itemHeight = Math.min(items[i].clientHeight, winHeight * 0.9);
            var topMax = document.documentElement.clientHeight - itemHeight - paddingTop;
            var leftMax = document.documentElement.clientWidth - itemWidth - paddingLeft;
            items[i].style.top = rand(paddingTop, topMax) + 'px';
            items[i].style.left = rand(paddingLeft, leftMax) + 'px';
        }
    })();

    // form error
    (function() {
        const formItems = document.querySelectorAll('.form-item');
        var timer = null;
        var enableOptionValue = 0;
        var enableCheckboxValue = 0;

        function focusHandler() {
            // observe enter
            function update(self) {
                // textarea
                if (self.hasClass('rcbrowser-textarea')) {
                    // has value
                    if (self.value !== '') {
                        self.parentNode.removeClass('is-error');
                    }
                }
                // number
                if (self.hasClass('rcbrowser-input--number')) {
                    // reward
                    if (self.hasClass('rcbrowser-input--number--reward')) {
                        // bigger than 0
                        if (self.value > 0) {
                            self.parentNode.parentNode.removeClass('is-error');
                        }
                    }
                    // add reward
                    else if (self.hasClass('rcbrowser-input--number--add-reward')) {
                        // bigger than 0
                        if (self.value > 0) {
                            self.parentNode.parentNode.removeClass('is-error');
                        }
                    }
                    // bond
                    else if (self.hasClass('rcbrowser-input--number--bond')) {
                        //get bond value
                        if (isFirstFocusBond) {
                            bondValue = parseFloat(self.getAttribute('placeholder'));
                            isFirstFocusBond = false;
                        }

                        // bigger than bond
                        if (self.value !== '' && self.value > 0 && self.value >= bondValue) {
                            self.parentNode.parentNode.removeClass('is-error');
                        }

                        // bigger than the balance
                        if (self.value > 5.6) {
                            self.parentNode.parentNode.querySelector('.error-container').textContent = 'Your balance is 5.6 ETH.';
                            self.parentNode.parentNode.addClass('is-error');
                        }
                        // has value & smaller than the balance
                        else if (self.value !== '' && self.value > 0 && self.value < 5.6) {
                            self.parentNode.parentNode.removeClass('is-error');
                        }
                    }
                    // answer
                    else if (self.hasClass('rcbrowser-input--number--answer')) {
                        // empty
                        if (self.value !== '') {
                            self.parentNode.parentNode.removeClass('is-error');
                        }
                    }
                }

                // select
                if (self.hasClass('rcbrowser-select')) {
                    if (self.getElementsByTagName('option')[0].selected === false) {
                        self.parentNode.removeClass('is-error');
                    }
                }

                // checkbox
                if (self.hasClass('rcbrowser-input--checkbox')) {
                    let checkboxItems = self.parentNode.parentNode.querySelectorAll('.form-item-value');
                    for (let i = 0, len = checkboxItems.length; i < len; i += 1) {
                        enableCheckboxValue = checkboxItems[i].checked ? enableCheckboxValue += 1 : enableCheckboxValue;
                    }

                    if (enableCheckboxValue > 0) {
                        self.parentNode.parentNode.removeClass('is-error');
                    }
                }

                // edit option
                if (self.parentNode.parentNode.parentNode.parentNode.hasClass('is-open')) {
                    let optionItems = self.parentNode.parentNode.querySelectorAll('.form-item');
                    for (let i = 0, len = optionItems.length; i < len; i += 1) {
                        enableOptionValue = optionItems[i].value ? enableOptionValue += 1 : enableOptionValue;
                    }

                    if (self.parentNode.parentNode.hasClass('is-error')) {
                        if (enableOptionValue > 1) {
                            self.parentNode.parentNode.removeClass('is-error');
                        }
                    }

                    enableOptionValue = 0;
                }

                timer = setTimeout(update.bind(undefined, self), 60);
            }
            update(this);
        }

        function blurHandler() {
            isFirstFocusBond = true;
            enableOptionValue = 0;

            clearTimeout(timer);
        }

        for (let i = 0, len = formItems.length; i < len; i += 1) {
            formItems[i].addEventListener('focus', focusHandler, true);
            formItems[i].addEventListener('blur', blurHandler, true);
        }

        // get question type
        (function() {
            const container = document.querySelector('.edit-option-container');
            const selector = document.getElementById('question-type');

            const parent = document.querySelector('.edit-option-inner');
            const addButton = document.querySelector('.add-option-button');

            selector.addEventListener('change', function() {
                var index = this.selectedIndex;
                var value = this.options[index].value;
                if (value === 'select') {
                    if (!container.hasClass('is-open')) {
                        container.style.display = 'block';
                        container.toggleClass('is-open');
                        container.addClass('is-bounce');
                    }
                } else {
                    container.removeClass('is-open');
                    container.removeClass('is-bounce');
                    container.style.display = 'none';

                    const inputEditOptions = document.querySelectorAll('.input-container--edit-option');
                    inputEditOptions[0].children[0].value = '';
                    for (let i = 1, len = inputEditOptions.length; i < len; i += 1) {
                        inputEditOptions[i].parentNode.removeChild(inputEditOptions[i]);
                    }
                    editOptionId = 0;
                }

                rcbrowserHeight();
            });

            addButton.addEventListener('click', function() {
                const errorContainer = document.querySelector('.error-container--select');
                var element = document.createElement('div');

                element.setAttribute('class', 'input-container input-container--edit-option');

                element.innerHTML = '<input type="text" name="editOption' + (editOptionId += 1) + '" class="rcbrowser-input rcbrowser-input--edit-option form-item" placeholder="Enter the option...">';

                element.children[0].addEventListener('focus', focusHandler, true);
                element.children[0].addEventListener('blur', blurHandler, true);

                parent.insertBefore(element, errorContainer);

                element.addClass('is-bounce');

                isFirstErrorEditOption = true;

                rcbrowserHeight();
            });
        })();
    })();

    // post question/answer/add reward
    (function() {
        const submitButtons = document.querySelectorAll('.rcbrowser-submit');
        const rcBrowsers = document.querySelectorAll('.rcbrowser');
        const myUserId = 'er9w8rwer8r9ewr89wr8e8r';
        const myAvatarSrc = 'assets/image/avatar1.png';

        function clickOpenHandler(e) {
            e.preventDefault();
            e.stopPropagation();

            const rcBrowserId = this.getAttribute('data-browser-id');
            var currentBrowser = null;
            for (let i = 0, len = rcBrowsers.length; i < len; i += 1) {
                var id = rcBrowsers[i].getAttribute('data-browser-id');
                if (id === rcBrowserId) {
                    currentBrowser = rcBrowsers[i];
                }
            }

            const forms = currentBrowser.querySelectorAll('.rcbrowser-form');
            const formType = this.getAttribute('data-form-type');
            var currentForm = null;
            for (let i = 0, len = forms.length; i < len; i += 1) {
                var type = forms[i].getAttribute('data-form-type');
                if (type === formType) {
                    currentForm = forms[i];
                }
            }

            // check question status
            if (!this.hasClass('rcbrowser-submit--postaquestion')) {
                var currentAnswerContainer = currentBrowser.querySelector('.current-answer-container');
                var hasCurrentAnswer = currentAnswerContainer.children[0] ? true : false;
                var answeredHistoryContainer = currentBrowser.querySelector('.answered-history-container');
                var hasAnsweredHistory = answeredHistoryContainer.children[0] ? true : false;

                _bondValue = parseFloat(currentBrowser.querySelector('.rcbrowser-input--number--bond').value);
            }

            const textarea = currentForm.querySelectorAll('textarea');
            const input = currentForm.querySelectorAll('input[type="text"]');
            const checkbox = currentForm.querySelectorAll('input[type="checkbox"]');
            const number = currentForm.querySelectorAll('input[type="number"]');
            const selectbox = currentForm.querySelectorAll('.rcbrowser-select');
            var isError = false;
            var enableOptionValue = 0;
            var enableCheckboxValue = 0;

            for (let i = 0, len = textarea.length; i < len; i += 1) {
                if (textarea[i].value === '') {
                    textarea[i].parentNode.addClass('is-error');
                    isError = true;
                } else {
                    textarea[i].parentNode.removeClass('is-error');
                }
            }

            for (let i = 0, len = input.length; i < len; i += 1) {
                if (input[i].hasClass('rcbrowser-input--edit-option')) {
                    enableOptionValue = input[i].value === '' ? enableOptionValue : enableOptionValue += 1;
                }
            }

            // edit option
            for (let i = 0, len = input.length; i < len; i += 1) {
                if (enableOptionValue < 2) {
                    if (input[i].parentNode.parentNode.parentNode.parentNode.hasClass('is-open')) {
                        input[i].parentNode.parentNode.addClass('is-error');
                        if (isFirstErrorEditOption) {
                            isFirstErrorEditOption = false;
                        }
                        isError = true;
                    } else {
                        input[i].parentNode.removeClass('is-error');
                    }
                }
            }

            // checkbox
            for (let i = 0, len = checkbox.length; i < len; i += 1) {
                if (checkbox[i].hasClass('rcbrowser-input--checkbox')) {
                    enableCheckboxValue = checkbox[i].checked === false ? enableCheckboxValue : enableCheckboxValue += 1;
                }
            }

            for (let i = 0, len = checkbox.length; i < len; i += 1) {
                if (enableCheckboxValue < 1) {
                    checkbox[i].parentNode.parentNode.addClass('is-error');
                    isError = true;
                } else {
                    checkbox[i].parentNode.parentNode.removeClass('is-error');
                }
            }

            // number
            for (let i = 0, len = number.length; i < len; i += 1) {
                // reward
                if (number[i].hasClass('rcbrowser-input--number--reward')) {
                    if (number[i].value === '' || number[i].value <= 0 ||  number[i].value > 5.6) {
                        number[i].parentNode.parentNode.addClass('is-error');

                        isError = true;
                    } else {
                        number[i].parentNode.parentNode.removeClass('is-error');
                    }
                }
                // add reward
                else if (number[i].hasClass('rcbrowser-input--number--add-reward')) {
                    if (number[i].value === '' || number[i].value <= 0) {
                        // update height

                        number[i].parentNode.parentNode.addClass('is-error');

                        isError = true;
                    } else {
                        number[i].parentNode.parentNode.removeClass('is-error');
                    }
                }
                // answer
                else if (number[i].hasClass('rcbrowser-input--number--answer')) {
                    if (number[i].value === '') {
                        number[i].parentNode.parentNode.addClass('is-error');

                        isError = true;
                    } else {
                        number[i].parentNode.parentNode.removeClass('is-error');
                    }
                }
                // bond
                else if (number[i].hasClass('rcbrowser-input--number--bond')) {
                    if (number[i].value === '' || number[i].value <= 0 || number[i].value < bondValue || number[i].value > 5.6) {
                        number[i].parentNode.parentNode.addClass('is-error');

                        if (number[i].value <= 0 || number[i].value < bondValue) {
                            if (number[i].value <= 0) {
                                number[i].parentNode.parentNode.querySelector('.error-container').innerHTML = 'Please enter a valid number.';
                            } else {
                                number[i].parentNode.parentNode.querySelector('.error-container').innerHTML = 'Please enter an amount of more than <span class="min-amount">' + bondValue + '</span>ETH.';
                            }
                        }

                        isError = true;
                    } else {
                        number[i].parentNode.parentNode.removeClass('is-error');
                    }
                }
            }

            for (let i = 0, len = selectbox.length; i < len; i += 1) {
                if (selectbox[i].getElementsByTagName('option')[0].selected === true) {
                    selectbox[i].parentNode.addClass('is-error');
                    isError = true;
                } else {
                    selectbox[i].parentNode.removeClass('is-error');
                }
            }

            if (isError) {
                if (currentBrowser.hasClass('.rcbrowser--postaquestion')) {
                    TweenLite.to(currentBrowser.querySelector('.rcbrowser-inner'), .8, { scrollTo: {y: 0, autoKill: true} });
                }
                rcbrowserHeight();
                return;
            } else {
                // scroll top
                TweenLite.to(currentBrowser.querySelector('.rcbrowser-inner'), .8, { scrollTo: {y: 0, autoKill: true} });
            }

            metamask.addClass('is-open');

            setTimeout(function() {
                metamask.removeClass('is-open');

                if (currentBrowser.hasClass('rcbrowser--qa-detail')) {
                    if (this.hasClass('rcbrowser-submit--add-reward')) {
                        const addValue = parseFloat(this.parentNode.parentNode.querySelector('.rcbrowser-input--number--add-reward').value);
                        const rewardValueContainer = currentBrowser.querySelector('.reward-value-container');
                        const rewardValue = currentBrowser.querySelector('.reward-value');
                        const currentReward = parseFloat(currentBrowser.querySelector('.reward-value').textContent, 10);
                        rewardValue.textContent = currentReward + addValue;
                        rewardValueContainer.addClass('is-bounce');
                    } else {
                        // deadline
                        const deadlineContainer = currentBrowser.querySelector('.answer-deadline');
                        const date = new Date();
                        const stepDelay = 6;
                        const hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
                        const munites = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
                        const deadline = 'Deadline: ' + monthList[date.getMonth()] + ' ' + (date.getDate() + stepDelay) + ', ' + date.getFullYear() + ' ' + hours + ':' + munites;
                        deadlineContainer.textContent = deadline;

                        if (hasCurrentAnswer) {
                            // if has answered history
                            if (hasAnsweredHistory) {

                                // get the current answer
                                let parent = this.parentNode.parentNode.parentNode.parentNode;
                                let answer = parent.querySelector('.current-answer-body').innerHTML;

                                // get the current answer bond
                                let bond = parent.querySelector('.current-answer-container').querySelector('.js-bond-value').innerHTML;

                                // get the current answer user id
                                let userId = parent.querySelector('.answer-data__user-id').children[1].textContent;

                                // get the current answer user avatar
                                let avatarSrc = parent.querySelector('.answer-data__avatar').getAttribute('data-avatar-src');

                                // create a answer item
                                let answeredHistoryItem = document.createElement('div');
                                answeredHistoryItem.setAttribute('class', 'answer-item answered-history-item');
                                answeredHistoryItem.innerHTML = '<div class="answered-history-body">' + answer + '</div><span>3 days ago</span><div class="answer-data"><div class="answer-data-inner"><div class="answer-data__avatar" style="background-image: url(' + avatarSrc + ')" data-avatar-src="' + avatarSrc + '"></div><div class="answer-data__item answer-data__user-id"><span>User ID: </span><span>' + userId + '</span></div><div class="answer-data__item answer-data__bond"><span>Bond: </span><span class="js-bond-value">' + bond + '</span><span>ETH</span></div></div></div></div>';

                                // add HTML elements
                                let lastAnswerItem = answeredHistoryContainer.children[1];
                                answeredHistoryContainer.insertBefore(answeredHistoryItem, lastAnswerItem);

                                // show answer data
                                let answerItem = answeredHistoryContainer.children[1];
                                answerItem.addEventListener('click', function() {
                                    let answerData = this.querySelector('.answer-data');
                                    if (!this.hasClass('is-open')) {
                                        this.addClass('is-open');
                                        answerData.style.display = 'block';
                                        answerData.addClass('is-bounce');
                                    } else {
                                        this.removeClass('is-open');
                                        answerData.style.display = 'none';
                                        answerData.removeClass('is-bounce');
                                    }

                                    rcbrowserHeight();
                                });

                                // get the new answer
                                let newAnswers = this.parentNode.parentNode.querySelectorAll('.form-item-value');
                                let _newAnswer = [];
                                let newAnswer = null;
                                for (let i = 0, len = newAnswers.length; i < len; i += 1) {
                                    // checkbox (multiple select)
                                    if (newAnswers[i].hasClass('rcbrowser-input--checkbox')) {
                                        if (newAnswers[i].checked) {
                                            _newAnswer.push(newAnswers[i].value);
                                            newAnswer = _newAnswer.join(' / ');
                                        }
                                    }
                                    // selectbox (single select, binary)
                                    else if (newAnswers[i].hasClass('rcbrowser-select')) {
                                        let options = newAnswers[i].getElementsByTagName('option');

                                        for (let _i = 0, len = options.length; _i < len; _i += 1) {
                                            if (options[_i].selected) {
                                                newAnswer = options[_i].value;
                                            }
                                        }
                                    }
                                    // textarea, number (free text, number)
                                    else {
                                        newAnswer = newAnswers[i].value;
                                    }
                                }

                                // set current answer
                                let currentAnswerBody = parent.querySelector('.current-answer-body');
                                let p = document.createElement('p');
                                p.innerHTML = newAnswer;
                                currentAnswerBody.textContent = null;
                                currentAnswerBody.appendChild(p);

                                // set time
                                let currentAnswerTime = parent.querySelector('.current-answer-time');
                                currentAnswerTime.textContent = 'Now';

                                // set bond
                                let answerDataBond = parent.querySelector('.js-bond-value');
                                answerDataBond.textContent = _bondValue;

                                // set user id
                                let answerDataUserID = parent.querySelector('.answer-data__user-id').children[1];
                                answerDataUserID.textContent = myUserId;

                                // set avatar
                                let answerDataAvatar = parent.querySelector('.answer-data__avatar');
                                answerDataAvatar.style.backgroundImage = 'url(' + myAvatarSrc + ')';
                                answerDataAvatar.setAttribute('data-avatar-src', myAvatarSrc);

                                currentAnswerContainer.querySelector('.current-answer-item').addClass('is-bounce');
                                setTimeout(function() {
                                    currentAnswerContainer.querySelector('.current-answer-item').removeClass('is-bounce');
                                }, 200);
                            }
                            // if no answered history
                            else {
                                // get the current answer
                                let parent = this.parentNode.parentNode.parentNode.parentNode;
                                let answer = parent.querySelector('.current-answer-body').innerHTML;

                                // get the current answer bond
                                let bond = parent.querySelector('.js-bond-value').innerHTML;

                                // get the current answer user id
                                let userId = parent.querySelector('.answer-data__user-id').children[1].textContent;

                                // get the current answer user avatar
                                let avatarSrc = parent.querySelector('.answer-data__avatar').getAttribute('data-avatar-src');

                                // create a current answer header
                                let answeredHistoryHeader = document.createElement('div');
                                answeredHistoryHeader.setAttribute('class', 'answered-history-header');
                                answeredHistoryHeader.innerHTML = '<span>Answered History</span>';

                                // create a answer item
                                let answeredHistoryItem = document.createElement('div');
                                answeredHistoryItem.setAttribute('class', 'answer-item answered-history-item');
                                answeredHistoryItem.innerHTML = '<div class="answered-history-body">' + answer + '</div><span>3 days ago</span><div class="answer-data"><div class="answer-data-inner"><div class="answer-data__avatar" style="background-image: url(' + avatarSrc + ')" data-avatar-src="' + avatarSrc + '"></div><div class="answer-data__item answer-data__user-id"><span>User ID: </span><span>' + userId + '</span></div><div class="answer-data__item answer-data__bond"><span>Bond: </span><span class="js-bond-value">' + bond + '</span><span>ETH</span></div></div></div></div>';

                                // add HTML elements
                                answeredHistoryContainer.appendChild(answeredHistoryHeader);
                                answeredHistoryContainer.appendChild(answeredHistoryItem);

                                // show answer data
                                let answerItem = answeredHistoryContainer.children[1];

                                answerItem.addEventListener('click', function() {
                                    let answerData = this.querySelector('.answer-data');
                                    if (!this.hasClass('is-open')) {
                                        this.addClass('is-open');
                                        answerData.style.display = 'block';
                                        answerData.addClass('is-bounce');
                                    } else {
                                        this.removeClass('is-open');
                                        answerData.style.display = 'none';
                                        answerData.removeClass('is-bounce');
                                    }

                                    rcbrowserHeight();
                                });

                                // get the new answer
                                let newAnswers = this.parentNode.parentNode.querySelectorAll('.form-item-value');
                                let _newAnswer = [];
                                let newAnswer = null;
                                for (let i = 0, len = newAnswers.length; i < len; i += 1) {
                                    // checkbox (multiple select)
                                    if (newAnswers[i].hasClass('rcbrowser-input--checkbox')) {
                                        if (newAnswers[i].checked) {
                                            _newAnswer.push(newAnswers[i].value);
                                            newAnswer = _newAnswer.join(' / ');
                                        }
                                    }
                                    // selectbox (single select, binary)
                                    else if (newAnswers[i].hasClass('rcbrowser-select')) {
                                        let options = newAnswers[i].getElementsByTagName('option');

                                        for (let _i = 0, len = options.length; _i < len; _i += 1) {
                                            if (options[_i].selected) {
                                                newAnswer = options[_i].value;
                                            }
                                        }
                                    }
                                    // textarea, number (free text, number)
                                    else {
                                        newAnswer = newAnswers[i].value;
                                    }
                                }

                                // set current answer
                                let currentAnswerBody = parent.querySelector('.current-answer-body');
                                let p = document.createElement('p');
                                p.innerHTML = newAnswer;
                                currentAnswerBody.textContent = null;
                                currentAnswerBody.appendChild(p);

                                // set time
                                let currentAnswerTime = parent.querySelector('.current-answer-time');
                                currentAnswerTime.textContent = 'Now';

                                // set bond
                                let answerDataBond = parent.querySelector('.js-bond-value');
                                answerDataBond.textContent = _bondValue;

                                // set user id
                                let answerDataUserID = parent.querySelector('.answer-data__user-id').children[1];
                                answerDataUserID.textContent = myUserId;

                                // set avatar
                                let answerDataAvatar = parent.querySelector('.answer-data__avatar');
                                answerDataAvatar.style.backgroundImage = 'url(' + myAvatarSrc + ')';
                                answerDataAvatar.setAttribute('data-avatar-src', myAvatarSrc);

                                currentAnswerContainer.querySelector('.current-answer-item').addClass('is-bounce');
                                setTimeout(function() {
                                    currentAnswerContainer.querySelector('.current-answer-item').removeClass('is-bounce');
                                }, 200);
                            }
                        }
                        // if no answer
                        else {
                            let _answer = [];
                            let answer = null;

                            // get the new answer
                            let answers = this.parentNode.parentNode.querySelectorAll('.form-item-value');
                            for (let i = 0, len = answers.length; i < len; i += 1) {
                                // checkbox (multiple select)
                                if (answers[i].hasClass('rcbrowser-input--checkbox')) {
                                    if (answers[i].checked) {
                                        _answer.push(answers[i].value);
                                        answer = _answer.join(' / ');
                                    }
                                }
                                // selectbox (single select, binary)
                                else if (answers[i].hasClass('rcbrowser-select')) {
                                    let options = answers[i].getElementsByTagName('option');

                                    for (let _i = 0, len = options.length; _i < len; _i += 1) {
                                        if (options[_i].selected) {
                                            answer = answer || options[_i].value;
                                        }
                                    }
                                }
                                // textarea, number (free text, number)
                                else {
                                    answer = answers[i].value;
                                }
                            }

                            // create a current answer inner
                            let currentAnswerInner = document.createElement('div');
                            currentAnswerInner.setAttribute('class', 'current-answer-inner');

                            // create a current answer header
                            let currentAnswerHeader = document.createElement('div');
                            currentAnswerHeader.setAttribute('class', 'current-answer-header');
                            currentAnswerHeader.innerHTML = '<span>Current Answer</span>';

                            // create a current answer item
                            let currentAnswerItem = document.createElement('div');
                            currentAnswerItem.setAttribute('class', 'answer-item current-answer-item');
                            currentAnswerItem.innerHTML = '<div class="current-answer-body"><p>' + answer + '</p></div><span class="current-answer-time">Now</span><div class="answer-data"><div class="answer-data-inner"><div class="answer-data__avatar" style="background-image: url(' + myAvatarSrc + ')" data-avatar-src="' + myAvatarSrc + '"></div><div class="answer-data__item answer-data__user-id"><span>User ID: </span><span>' + myUserId + '</span></div><div class="answer-data__item answer-data__bond answer-data__bond--current"><span>Bond: </span><span class="js-bond-value">0</span><span>ETH</span></div></div></div>';

                            // add HTML elements
                            currentAnswerInner.appendChild(currentAnswerHeader);
                            currentAnswerInner.appendChild(currentAnswerItem);
                            currentAnswerContainer.appendChild(currentAnswerInner);

                            // currentAnswerContainer.addClass('is-open');

                            // set bond
                            let answerDataBond = currentAnswerContainer.querySelector('.js-bond-value');
                            answerDataBond.textContent = _bondValue;

                            // answer data
                            let answerItem = currentAnswerContainer.querySelector('.answer-item');

                            currentAnswerContainer.querySelector('.current-answer-item').addClass('is-bounce');
                            setTimeout(function() {
                                currentAnswerContainer.querySelector('.current-answer-item').removeClass('is-bounce');
                            }, 200);

                            answerItem.addEventListener('click', function() {
                                let answerData = this.querySelector('.answer-data');
                                if (!this.hasClass('is-open')) {
                                    this.addClass('is-open');
                                    answerData.style.display = 'block';
                                    answerData.addClass('is-bounce');
                                } else {
                                    this.removeClass('is-open');
                                    answerData.style.display = 'none';
                                    answerData.removeClass('is-bounce');
                                }

                                rcbrowserHeight();
                            });

                            currentBrowser.addClass('has-answer');
                        }
                    }
                }

                const textarea = currentForm.querySelectorAll('textarea');
                const input = currentForm.querySelectorAll('input[type="text"]');
                const checkbox = currentForm.querySelectorAll('input[type="checkbox"]');
                const number = currentForm.querySelectorAll('input[type="number"]');
                const selectbox = currentForm.querySelectorAll('.rcbrowser-select');

                for (let i = 0, len = textarea.length; i < len; i += 1) {
                    textarea[i].value = '';
                }
                for (let i = 0, len = input.length; i < len; i += 1) {
                    input[i].value = '';
                }
                for (let i = 0, len = checkbox.length; i < len; i += 1) {
                    checkbox[i].checked = false;
                }
                for (let i = 0, len = number.length; i < len; i += 1) {
                    number[i].value = '';
                }
                for (let i = 0, len = selectbox.length; i < len; i += 1) {
                    selectbox[i].getElementsByTagName('option')[0].selected = true;
                }

                if (currentBrowser.hasClass('rcbrowser--postaquestion')) {
                    const container = document.querySelector('.edit-option-container');
                    container.removeClass('is-open');
                    container.style.height = 0;

                    const inputEditOptions = document.querySelectorAll('.input-container--edit-option');
                    for (let i = 1, len = inputEditOptions.length; i < len; i += 1) {
                        inputEditOptions[i].parentNode.removeChild(inputEditOptions[i]);
                    }
                    editOptionId = 0;
                }

                if (currentBrowser.hasClass('rcbrowser--qa-detail')) {
                    if (this.hasClass('rcbrowser-submit--add-reward')) {
                        const rewardValueContainer = currentBrowser.querySelector('.reward-value-container');
                        setTimeout(function() {
                            rewardValueContainer.removeClass('is-bounce');
                        }, 300);
                    } else {
                        const bondForm = currentBrowser.querySelector('.rcbrowser-input--number--bond');
                        bondValue = (bondUnit + _bondValue) * 2;
                        bondForm.placeholder = bondValue;
                        currentBrowser.querySelector('.min-amount').textContent = bondValue;
                    }
                }

                rcbrowserHeight();
            }.bind(this), 3000);

            if (currentBrowser.hasClass('rcbrowser--postaquestion')) {
                setTimeout(function(){
                    const checkYourQATooltip = document.querySelector('.tooltip--checkyourqa');
                    checkYourQATooltip.addClass('is-visible');
                    checkYourQATooltip.addClass('is-bounce');
                    setTimeout(function(){
                        checkYourQATooltip.removeClass('is-visible');
                        checkYourQATooltip.removeClass('is-bounce');
                    }, 5000);
                }, 3000);
            }
        }

        for (let i = 0, len = submitButtons.length; i < len; i += 1) {
            submitButtons[i].addEventListener('click', clickOpenHandler);
        }
    })();

    // arbitration
    (function() {
        const buttons = document.querySelectorAll('.final-answer-button');
        const rcBrowsers = document.querySelectorAll('.rcbrowser');

        function clickHandler(e) {
            e.stopPropagation();

            const rcBrowserId = this.getAttribute('data-browser-id');
            var currentBrowser = null;
            for (let i = 0, len = rcBrowsers.length; i < len; i += 1) {
                var id = rcBrowsers[i].getAttribute('data-browser-id');
                if (id === rcBrowserId) {
                    currentBrowser = rcBrowsers[i];
                }
            }

            // set Final Answer
            currentBrowser.querySelector('.current-answer-body').children[0].textContent = this.getAttribute('data-answer');

            // set resolved date
            const date = new Date();
            const resolvedDate = monthList[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
            currentBrowser.querySelector('.rcbrowser-main-header-subtitle').innerHTML = 'Resolved at ' + resolvedDate;

            // delete deadline
            currentBrowser.querySelector('.answer-deadline').parentNode.removeChild(currentBrowser.querySelector('.answer-deadline'));

            // delete apply for ...
            currentBrowser.querySelector('.arbitration-button--applied').parentNode.removeChild(currentBrowser.querySelector('.arbitration-button--applied'));

            // delete time
            currentBrowser.querySelector('.current-answer-time').parentNode.removeChild(currentBrowser.querySelector('.current-answer-time'));

            // change word current answer
            currentBrowser.querySelector('.current-answer-header').innerHTML = '<span>Final Answer</span>';

            // delete answer history container
            currentBrowser.querySelector('.answered-history-container').parentNode.removeChild(currentBrowser.querySelector('.answered-history-container'));

            currentBrowser.querySelector('.current-answer-container').style.marginTop = 0;

            currentBrowser.querySelector('.current-answer-item').addClass('is-bounce');

            for (let i = 0, len = buttons.length; i < len; i += 1) {
                buttons[i].parentNode.removeChild(buttons[i]);
            }

            rcbrowserHeight();
        }

        for (let i = 0, len = buttons.length; i < len; i += 1) {
            buttons[i].addEventListener('click', clickHandler);
        }
    })();

    // apply for arbitration
    (function() {
        const arbitrationButtons = document.querySelectorAll('.arbitration-button');

        function clickOpenHandler(e) {
            e.preventDefault();
            e.stopPropagation();

            metamask.addClass('is-open');

            setTimeout(function() {
                metamask.removeClass('is-open');
                this.parentNode.innerHTML = '<div class="arbitration-button" style="color: #fff;">Applied for arbitration at Jonh Doe.</div>';
                this.addClass('is-bounce');
            }.bind(this), 3000);

            setTimeout(function() {
                this.removeClass('is-bounce');
            }.bind(this), 5000);
        }

        for (let i = 0, len = arbitrationButtons.length; i < len; i += 1) {
            arbitrationButtons[i].addEventListener('click', clickOpenHandler);
        }
    })();

    // RCBrowser custom scrollbar
    (function() {
        const rcbrowsers = document.querySelectorAll('.rcbrowser-inner');

        for (let i = 0, len = rcbrowsers.length; i < len; i += 1) {
            Ps.initialize(rcbrowsers[i]);
        }

        function changeSize() {
            for (let i = 0, len = rcbrowsers.length; i < len; i += 1) {
                Ps.update(rcbrowsers[i]);
            }
        }
        window.addEventListener('resize', changeSize);
    })();

    // draggable
    interact('.rcbrowser-header').draggable({
        // enable inertial throwing
        inertia: false,
        // keep the element within the area of it's parent
        restrict: {
            restriction: 'self',
            endOnly: true,
            elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
        },
        // enable autoScroll
        autoScroll: false,

        // call this function on every dragmove event
        onmove: dragMoveListener,
    });
    function dragMoveListener (event) {
        clickCounter += 1;
        var target = event.target.parentNode.parentNode;
        target.style.zIndex = clickCounter;
        // keep the dragged position in the data-x/data-y attributes
        var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
        var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

        // translate the element
        target.style.webkitTransform =
        target.style.transform =
        'translate(' + x + 'px, ' + y + 'px)';

        // update the posiion attributes
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
    }
    // this is used later in the resizing and gesture demos
    window.dragMoveListener = dragMoveListener;

    // set RCBrowser anchor
    function setRCBAnchor() {
        const openButton = document.querySelectorAll('.rcbrowser__open-button');
        const closeButton = document.querySelectorAll('.rcbrowser__close-button');
        const rcBrowsers = document.querySelectorAll('.rcbrowser');

        function clickZindexHandler(e) {
            // e.preventDefault();
            e.stopPropagation();
            if (this.getAttribute('data-target-id')) {
                return;
            } else {
                clickCounter += 1;
                this.style.zIndex = clickCounter;
            }
        }

        function clickOpenHandler(e) {
            e.preventDefault();
            e.stopPropagation();

            const targetId = this.getAttribute('data-target-id');

            for (let i = 0, len = rcBrowsers.length; i < len; i += 1) {
                var id = rcBrowsers[i].getAttribute('data-browser-id');
                if (id === targetId) {
                    clickCounter += 1;
                    rcBrowsers[i].style.zIndex = clickCounter;
                    rcBrowsers[i].addClass('is-open');

                    for (let i = 0, len = rcBrowsers.length; i < len; i += 1) {
                        rcBrowsers[i].removeClass('js-rcb-current-active');
                    }

                    rcBrowsers[i].addClass('js-rcb-current-active');
                }
            }
        }

        function clickCloseHandler(e) {
            e.preventDefault();
            e.stopPropagation();

            const targetId = this.getAttribute('data-target-id');

            for (let i = 0, len = rcBrowsers.length; i < len; i += 1) {
                var id = rcBrowsers[i].getAttribute('data-browser-id');
                if (id === targetId) {
                    rcBrowsers[i].removeClass('is-open');
                    rcBrowsers[i].removeClass('js-rcb-current-active');
                }
            }

            document.documentElement.setAttribute('style', '');
        }

        for (let i = 0, len = rcBrowsers.length; i < len; i += 1) {
            rcBrowsers[i].addEventListener('click', clickZindexHandler);
        }

        for (let i = 0, len = openButton.length; i < len; i += 1) {
            openButton[i].addEventListener('click', clickOpenHandler);
        }
        for (let i = 0, len = closeButton.length; i < len; i += 1) {
            closeButton[i].addEventListener('click', clickCloseHandler);
        }

    }
    setRCBAnchor();

    // see all notifications
    (function() {
        const rcBrowser = document.querySelector('.rcbrowser--your-qa');
        const container = document.querySelector('.rcbrowser-main-body--your-qa');
        const anchor = document.querySelector('.see-all-notifications');
        const notifications = [].slice.call(document.querySelectorAll('.notifications-item'));
        var notificationsList = [];
        const docFragment = document.createDocumentFragment();

        for (let i = 0; i < 4; i += 1) {
            for (let i = 0, len = notifications.length; i < len; i += 1) {
                notificationsList.push(notifications[i]);
            }
        }

        function clickHandler(e) {
            e.preventDefault();

            container.textContent = null;

            rcBrowser.addClass('is-loading');
            setTimeout(function() {
                const notificationsListLength = notificationsList.length;
                for (let i = 0; i < notificationsListLength; i += 1) {
                    const elementContainer = document.createElement('div');
                    elementContainer.setAttribute('class', 'notifications-item rcbrowser__open-button');
                    elementContainer.setAttribute('data-target-id', 'id1');
                    elementContainer.innerHTML = notificationsList[i].innerHTML;

                    docFragment.appendChild(elementContainer);
                }
                container.appendChild(docFragment);
                setRCBAnchor();
                rcBrowser.removeClass('is-loading');
            }, 1500);
        }

        anchor.addEventListener('click', clickHandler);
    })();

    // open/close add reward
    (function() {
        const rcBrowsers = document.querySelectorAll('.rcbrowser');
        const openButtons = document.querySelectorAll('.add-reward-button');
        const closeButtons = document.querySelectorAll('.add-reward__close-button');

        function clickHandler() {
            const rcBrowserId = this.getAttribute('data-browser-id');
            for (let i = 0, len = rcBrowsers.length; i < len; i += 1) {
                var id = rcBrowsers[i].getAttribute('data-browser-id');
                if (id === rcBrowserId) {
                    var currentBrowser = rcBrowsers[i];
                }
            }

            const container = currentBrowser.querySelector('.add-reward-container');

            if (container.hasClass('is-open')) {
                container.removeClass('is-open');
                container.style.display = 'none';
                container.removeClass('is-bounce');
            } else {
                container.addClass('is-open');
                container.style.display = 'block';
                container.addClass('is-bounce');
            }


            rcbrowserHeight();
        }

        for (let i = 0, len = openButtons.length; i < len; i += 1) {
            openButtons[i].addEventListener('click', clickHandler);
        }

        for (let i = 0, len = closeButtons.length; i < len; i += 1) {
            closeButtons[i].addEventListener('click', clickHandler);
        }
    })();

    // page loaded
    (function() {
        function loadHandler() {
            imagesLoaded( document.getElementById('cover'), { background: true }, function() {
                document.body.addClass('is-page-loaded');
            });
        }
        window.addEventListener('load', loadHandler);
    })();

    // loadmore loading
    (function() {
        const elements = document.querySelectorAll('.loadmore-button');

        function clickHandler() {
            this.toggleClass('is-loading');
        }

        for (let i = 0, len = elements.length; i < len; i += 1) {
            elements[i].addEventListener('click', clickHandler);
        }
    })();

    // smooth scroll
    (function() {
        const elements = document.querySelectorAll('[href^="#"]');

        function clickHandler(e) {
            e.preventDefault();
            const duration = 2;
            const href = this.getAttribute('href');
            const target = href === '#' || href === null ? 'html' : href;
            const targetPosition = target === 'html' ? 0 : document.querySelectorAll(target)[0].getBoundingClientRect().top + window.pageYOffset;
            TweenLite.to(window, duration, { scrollTo: {y: targetPosition, autoKill: true}, ease: Power3.easeOut });
        }

        for (let i = 0, len = elements.length; i < len; i += 1) {
            elements[i].addEventListener('click', clickHandler);
        }
    })();

    // observe a search-form
    (function() {
        const inputElement = document.getElementById('search-input');
        const formElement = document.getElementById('search-form');
        const reslutNumberElement = document.getElementById('result-number');
        var timer = null;

        function focusHandler() {
            function update() {
                if (inputElement.value === '') {
                    formElement.style.borderColor = '#3a3c40';
                    reslutNumberElement.textContent = '';
                } else if (inputElement.value === 'y' || inputElement.value === 'ya' || inputElement.value === 'yan') {
                    formElement.style.borderColor = '#0d6ffc';
                    reslutNumberElement.style.color = '#0d6ffc';
                    reslutNumberElement.textContent = '6 Hit';
                } else if (inputElement.value === 'yank') {
                    formElement.style.borderColor = '#0d6ffc';
                    reslutNumberElement.style.color = '#0d6ffc';
                    reslutNumberElement.textContent = '3 Hit';
                } else if (inputElement.value === 'yanke' || inputElement.value === 'yankee' || inputElement.value === 'yankees') {
                    formElement.style.borderColor = '#0d6ffc';
                    reslutNumberElement.style.color = '#0d6ffc';
                    reslutNumberElement.textContent = '1 Hit';
                }
                // no hit
                else {
                    formElement.style.borderColor = '#ff4444';
                    reslutNumberElement.style.color = '#ff4444';
                    reslutNumberElement.textContent = '0 Hit';
                }
                timer = setTimeout(update, 60);
            }
            update();
        }

        function blurHandler() {
            formElement.style.borderColor = '#3a3c40';
            reslutNumberElement.textContent = '';
            clearTimeout(timer);
        }

        inputElement.addEventListener('focus', focusHandler);
        inputElement.addEventListener('blur', blurHandler);
    })();

}());
