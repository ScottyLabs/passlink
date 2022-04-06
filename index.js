const axios = require("axios");

class Passlink {
  #listener;
  #window;
  #apiPath;

  constructor(window) {
    this.#listener = null;
    this.#apiPath = "https://login.scottylabs.org";
    if (window) {
      this.#window = window;
    }
  }

  #popupCenter(title, w, h, onClose) {
    if (!this.#window) {
      throw new Error("Cannot open new popup if Window is not a window.");
    }

    let dualScreenLeft;
    if (this.#window.screenLeft !== undefined) {
      dualScreenLeft = this.#window.screenLeft;
    } else {
      dualScreenLeft = this.#window.screenX;
    }

    let dualScreenTop;
    if (this.#window.screenTop !== undefined) {
      dualScreenTop = this.#window.screenTop;
    } else {
      dualScreenTop = this.#window.screenY;
    }

    let width;
    if (this.#window.innerWidth) {
      width = this.#window.innerWidth;
    } else if (this.#window.document.documentElement.clientWidth) {
      width = this.#window.document.documentElement.clientWidth;
    } else {
      width = this.#window.screen.width;
    }

    let height;
    if (this.#window.innerHeight) {
      height = this.#window.innerHeight;
    } else if (this.#window.document.documentElement.clientHeight) {
      height = this.#window.document.documentElement.clientHeight;
    } else {
      height = this.#window.screen.height;
    }

    const systemZoom = width / this.#window.screen.availWidth;
    const left = (width - w) / 2 / systemZoom + dualScreenLeft;
    const top = (height - h) / 2 / systemZoom + dualScreenTop;
    const newWindow = this.#window.open(
      "about:blank",
      title,
      `
      scrollbars=yes,
      width=${w / systemZoom}, 
      height=${h / systemZoom}, 
      top=${top}, 
      left=${left}
      `
    );

    newWindow?.focus();

    const pollTimer = this.#window.setInterval(() => {
      if (newWindow && newWindow.closed !== false) {
        this.#window.clearInterval(pollTimer);
        if (this.#listener) {
          this.#window.removeEventListener("message", this.#listener);
          this.removeListener();
        }
        if (onClose) {
          onClose();
        }
      }
    }, 200);

    return newWindow;
  }

  setAPIEndpoint(url) {
    this.#apiPath = url;
  }

  generateloginHandler(
    signPath,
    onOpen,
    onRequestFail,
    onLoginError,
    onLoginClose,
    onLoginSuccess
  ) {
    return () => {
      if (onOpen) {
        onOpen();
      }
      const loginWindow = this.#popupCenter(
        "Login with CMU Email",
        400,
        600,
        onLoginClose
      );
      axios.get(signPath).then((response) => {
        if (response.data.token) {
          if (loginWindow) {
            loginWindow.location.href =
              this.#apiPath + "/login/" + response.data.token;
          } else if (onRequestFail) {
            onRequestFail();
          }
        }
      });

      const loginListener = (event) => {
        if (event.origin !== this.#apiPath) {
          return;
        } else if (event.data === "error") {
          if (this.#listener) {
            this.#window.removeEventListener("message", loginListener);
            this.removeListener();
          }
          if (onLoginError) {
            onLoginError();
          }
        } else if (onLoginSuccess) {
          if (this.#listener) {
            this.#window.removeEventListener("message", loginListener);
            this.removeListener();
          }
          if (onLoginSuccess) {
            onLoginSuccess(event.data);
          }
        }
      };
      this.#window.addEventListener("message", loginListener, false);
      this.#listener = loginListener;
    };
  }

  removeListener() {
    this.#listener = null;
  }
}

module.exports = Passlink;
