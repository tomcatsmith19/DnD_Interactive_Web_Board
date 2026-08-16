import{r as e}from"./tooltips-CSQuPvuv.js";var t=null,n=null;function r(r){localStorage.getItem(`installationDontAsk`)||(t=i(),n=r,window.addEventListener(`appinstalled`,()=>{e(`Application is installed`,!1,`success`,8e3),o()}))}function i(){let t=document.createElement(`button`);return t.style.cssText=`
      position: fixed;
      top: 1em;
      right: 1em;
      padding: 0.6em 0.8em;
      width: auto;
    `,t.className=`options glow`,t.innerHTML=`Install`,t.onclick=a,t.onmouseenter=()=>e(`Install the Application`),document.getElementById(`optionsContainer`).appendChild(t),t}function a(){alertMessage.innerHTML=`You can install the tool so that it will look and feel like desktop application:
    have its own icon on your home screen and work offline with some limitations
  `,$(`#alert`).dialog({resizable:!1,title:`Install the Application`,width:`38em`,buttons:{Install:function(){$(this).dialog(`close`),n?.prompt()},Cancel:function(){$(this).dialog(`close`)}},open:function(){this.parentElement.querySelector(`.ui-dialog-buttonpane`).insertAdjacentHTML(`afterbegin`,`<span><input id="dontAsk" class="checkbox" type="checkbox"><label for="dontAsk" class="checkbox-label dontAsk"><i>do not ask again</i></label></span>`)},close:function(){this.parentElement.querySelector(`.checkbox`)?.checked&&(localStorage.setItem(`installationDontAsk`,`true`),o()),$(this).dialog(`destroy`)}})}function o(){t?.remove(),t=null,n=null}var s={init:r};export{s as Installation};