class helpers {
  //   ==============
  //  Helpers
  genElem = (elemName, classes, attrs) => {
    const elem = document.createElement(elemName);

    if (classes)
      classes.forEach((el) => {
        elem.classList.add(el);
      });
    if (attrs)
      attrs.forEach((attr) => {
        elem.setAttribute(attr[0], attr[1]);
      });

    return elem;
  };

  genBtn = (classes, attrs, extraAttrs, text, parent) => {
    const btnElem = this.genElem("button", classes, [...attrs, extraAttrs]);

    btnElem.textContent = text;

    parent.appendChild(btnElem);
  };

  genOpt = (text, value, selectAttrs, parent) => {
    //  7
    const opt = this.genElem(
      "option",
      ["V-P__option"],
      [...selectAttrs, ["value", value]]
    );
    opt.textContent = text;
    parent.appendChild(opt);
  };
}

export default helpers;
