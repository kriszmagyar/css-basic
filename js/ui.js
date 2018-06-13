;
(function (global) {

    'use strict'

    var ui = function () {
        return new ui.init()
    }

    ui.prototype = {

        /*-----------------------
                Alert functions
        -------------------------*/

        alert: function (obj) {
            // obj parameters:
            // content: html text - required
            // type: 'success' || 'danger' - optional
            // time: after that the alert will be removed (ms) - optional

            // Set the default params
            var time = obj.time || 3000
            var alertDeck
            var self = this

            // Create main alert
            var alert = document.createElement('div')
            alert.className = 'alert ' + obj.type

            // Create content
            var content = document.createElement('div')
            content.className = 'content'
            content.innerHTML = obj.content
            alert.appendChild(content)

            // Find the alert deck
            alertDeck = document.querySelector('.alert-deck')

            // If there is not any, create one!
            if (!alertDeck) {
                alertDeck = document.createElement('div')
                alertDeck.className = 'alert-deck'
                document.querySelector('body').appendChild(alertDeck)
            }

            // Append the alert to the deck
            alertDeck.appendChild(alert)

            // Add remove event listener to thr alert
            alert.addEventListener('click', function () {
                self.removeAlert(alert)
            })

            // Remove after a given time
            setTimeout(function () {
                self.removeAlert(alert)
            }, time)

            return alert
        },

        removeAlert: function (alert) {
            // Remove the alert in time, beacuse of animations
            alert.classList.add('remove')
            setTimeout(function () {
                alert.remove()
            }, 250)
        },

        /*-----------------------
                Form validation
        -------------------------*/

        form: function (form, validator, callback) {
            // Set an event listener on submit and when the user submits the form,
            // calls the callback function, which gets the parameters of the results
            var self = this
            var callback = callback || function(){}
            document.querySelector(form)
                .addEventListener('submit', function (e) {
                    e.preventDefault()
                    callback(self.validateForm(this, validator))
                })
        },

        validateForm: function (form, validator) {

            var
                fieldValue, fieldName,
                ruleType, ruleMsg, numbOfRules,
                errorList = [],
                invalidFieldList = [],
                validFields = [],
                i, j

            // Destroy the current message, if there is any
            this.destroyFormMessage(form)

            // Remove all the invalid tags from the fields
            for (var i = 0; i < form.children.length; i++) {
                form.children[i].classList.remove('invalid')
            }

            // Go throw the array of validation
            for (i = 0; i < validator.length; i++) {
                // Get the field name and value from the object
                fieldName = validator[i].name

                // If the field is a checkbox, the value can be obtained via the checked attribute
                if (form.elements[fieldName].type === 'checkbox') {
                    fieldValue = form.elements[fieldName].checked
                } else {
                    fieldValue = form.elements[fieldName].value

                }

                // Go throw the array of rules, in case of the current field
                numbOfRules = validator[i].rules.length
                for (j = 0; j < numbOfRules; j++) {
                    // Get the type of rule and error massage
                    ruleType = validator[i].rules[j].type
                    ruleMsg = validator[i].rules[j].message

                    // Validate the value of the input field, based on the rule
                    switch (ruleType) {
                        case 'required':
                            // Check if the value is empty or false
                            if (fieldValue === '' || fieldValue === false) {
                                // If the field is empty push the error message
                                errorList.push(ruleMsg)
                                // And push the name of the invalid field
                                invalidFieldList.push(fieldName)
                            } else {
                                // The field is valid, push it tot the valid field list
                                validFields.push({
                                    name: fieldName,
                                    value: fieldValue
                                })
                            }
                            break

                        default:
                            console.log('[Error] There is no such rule.')
                            break
                    }
                }
            } // Went throw the array of rules

            // If there are error messages, the form is invalid. We return false and the error messages.
            if (invalidFieldList.length === 0) {
                return {
                    valid: true,
                    fields: validFields
                }
            } else {

                // The form is invalid
                // Create the message
                this.buildFormMessage(form, errorList, 'error')

                // Mark the invalid fields
                for (var i = 0; i < invalidFieldList.length; i++) {
                    // No support for closest in IE !
                    form.elements[invalidFieldList[i]].closest('.field').classList.add('invalid')
                }

                // Return the validation values and error msges
                return {
                    valid: false,
                    msg: errorList,
                    fields: invalidFieldList
                }
            }
        },

        buildFormMessage: function (form, msgArr, type) {
            // Create the response text, when a form was submitted
            // Form: Where to attach the Message
            // msgList: The array of the messages
            // type: error | success

            // Create the basic div element and add the classes
            var msgDiv = document.createElement('div')
            msgDiv.className = 'message ' + type

            // Create the title
            var msgTitle = document.createElement('div')
            msgTitle.className = 'title'
            msgTitle.innerText = type === 'error' ? 'Oops! Something went wrong!' : null
            msgDiv.appendChild(msgTitle)

            // Create the ul element for the list
            var msgList = document.createElement('ul')

            // Create the li elements for the list
            var msgItem
            for (var i = 0; i < msgArr.length; i++) {
                msgItem = document.createElement('li')
                msgItem.innerText = msgArr[i]
                msgList.appendChild(msgItem)
            }

            // Append the list to the div
            msgDiv.appendChild(msgList)
            // Append the div to the form
            form.appendChild(msgDiv)
        },

        destroyFormMessage: function (form) {
            // Destroy the current message, if there is any
            try {
                var msg = form.querySelector('.message')
                form.removeChild(msg)
            } catch (e) {}
        },

        /*-----------------------
                Modal functions
        -------------------------*/

        addModalOpenListeners: function () {
            var self = this,
                target
            // Search all the element with the data-target, that's how the user can identify, witch button opens witch modal.
            // For e.: data-target="#myModal"
            document.querySelectorAll('[data-target]')
                .forEach(function (toggler) {
                    toggler.addEventListener('click', function () {
                        // target: id of the modal
                        target = toggler.dataset.target
                        self.openModal(target)
                    })
                })
        },

        addModalCloseListeners: function () {
            var self = this
            document.querySelectorAll('.modal')
                .forEach(function (modal) {
                    // First add the close function to the whole modal, including the dimmer. So the user will close the modal, if clicks outside of it.
                    modal.addEventListener('click', function () {
                        self.closeModal('#' + modal.id)
                    })
                    // Don't close the modal, when clicking anywhere on the window
                    modal.querySelector('.window')
                        .addEventListener('click', function (e) {
                            e.stopPropagation()
                        })
                    // Close the modal when clicking one of the close buttons.
                    modal.querySelectorAll('.close-icon, .close-btn')
                        .forEach(function (selector) {
                            selector.addEventListener('click', function () {
                                self.closeModal('#' + modal.id)
                            })
                        })
                })
        },

        openModal: function (id) {
            // Open the modal
            // But first: close any open modal
            try {
                this.closeModal('.modal.active')
                // When there is no such modal, an error would occur, this line prevents that.
            } catch (e) {}
            // In every case open the modal with the given ID.
            finally {
                setTimeout(function () {
                    try {
                        document.querySelector(id).classList.add('active')
                    } catch (e) {
                        console.error('There is no modal with a given ID:', id)
                    }
                }, 0)
            }
        },

        closeModal: function (id) {
            var modal = document.querySelector(id)
            // Start the modal closing animation by adding the close class.
            modal.classList.add('close')
            // Because of the animations, the classes must be removed in a given time.
            setTimeout(function () {
                modal.classList.remove('active')
            }, 125)
            setTimeout(function () {
                modal.classList.remove('close')
            }, 125)
        },

        /*-----------------------
                Navigation
        -------------------------*/

        addNavLinkListeners: function () {
            var self = this
            // Nav link is the anchor tag of the nav item.
            document.querySelectorAll('.nav .item')
                .forEach(function (item) {
                    // Set up the venet listeners.
                    item.addEventListener('click', function () {
                        // Set the ITEM active
                        self.setActive(this)
                    })
                })
        },

        addToggleBtnListener: function () {
            var self = this
            // Opens and closes the collapse part of the nav (on mobile).
            document.querySelectorAll('.nav .toggle')
                .forEach(function (toggle) {
                    // Set up the event listeners.
                    toggle.addEventListener('click', function () {
                        // Give it a time paramater, which has to be in sync with the css transition effects.
                        self.toggleCollapse()
                    })
                })
        },

        setActive: function (div) {
            // Onclick set active the clicked div, and remove active from others.
            div.classList.add('active')
            // Siblings are items in the same level of the div.
            this.siblings(div).map(function (div) {
                // Remove the active class from the other links, so only one can be active at a time.
                div.classList.remove('active')
            })
            // When on a mobile device, it closes the menu when clicking on a link.
            this.closeCollapse()
        },

        /*-----------------------
                Collapse
        -------------------------*/

        toggleCollapse: function (collapse, time) {
            var collapse = collapse || document.querySelector('.nav .collapse'),
                time = time || 300
            // Decide if we have to close or open the collapse.
            if (collapse.classList.contains('active')) {
                this.closeCollapse(collapse, time)
            } else {
                this.openCollapse(collapse, time)
            }
        },

        closeCollapse: function (collapse, time) {
            var collapse = collapse || document.querySelector('.nav .collapse'),
                time = time || 300
            
            // The height is dynamic, so first of all it has to be removed, for a nice transition effect.
            this.removeHeight()
            collapse.classList.add('collapsing')
            // Async remove the active and collapsing class, so the transition effects can be seen.
            setTimeout(function () {
                collapse.classList.remove('active')
            }, 0)
            setTimeout(function () {
                collapse.classList.remove('collapsing')
            }, time)
        },

        openCollapse: function (collapse, time) {
            var self = this,
                collapse = collapse || document.querySelector('.nav .collapse'),
                time = time || 300
            // We have to use two classes basically. One for during the transition (collapsing), and the other for the final position (active).
            collapse.classList.add('collapsing')
            // Async add the classes, cause of animation purposes.
            // When you change the display property of an element, it cancels the animation on it.
            setTimeout(function () {
                // Dynamically set the height of the collapse.
                self.setActiveHeight()
                collapse.classList.add('active')
            }, 0)
            setTimeout(function () {
                // When the transition finished, we can remove the collapsing class.
                collapse.classList.remove('collapsing')
            }, time)
        },

        setActiveHeight: function() {
            // Dynamically set the height of the collapse, based on the height of ots elements.
            var collapse = document.querySelector('.nav .collapse')
            var h = collapse.querySelector('ul').offsetHeight
            collapse.setAttribute('style', 'height:' + h + 'px')
        },

        removeHeight: function() {
            // Reset the style attribute (which includes the height) on the collapse element.
            document.querySelector('.nav .collapse').setAttribute('style', '')
        },
        
        siblings: function(div) {
            // This is a utility function, input is a div element and the output is the list of its 'brothers' or 'siblings'. Basically the divs that are on the same level as the original input div.
            var parent = div.parentNode
            var children = parent.children
            var numbOfChildren = children.length
            var siblingList = []

            // Add every div to the list, but not the input div
            for (var i = 0; i < numbOfChildren; i++) {
                if (children[i] !== div) {
                    siblingList.push(children[i])
                }
            }
            return siblingList
        }

    }

    ui.init = function () {

        // Add modal open listeners
        this.addModalOpenListeners()
        this.addModalCloseListeners()

        // Add nav elements listeners
        this.addNavLinkListeners()
        this.addToggleBtnListener()

    }

    ui.init.prototype = ui.prototype
    global.ui = ui

}(window))