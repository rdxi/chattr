function scrollToBottom(element) {
  element.scrollTop = element.scrollHeight - element.clientHeight;
}

module.exports = scrollToBottom;