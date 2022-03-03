export = Passlink;
/**
 * Helper to link to scottypass
 */
declare class Passlink {
  /**
   * Initializes a new PassLink instance.
   *
   * @param window The browser's window object.
   */
  constructor(window: Window);

  /**
   * Creates a function that can be passed in to a button's onClick method.
   *
   * @param signPath The path to your API's Sign Request endpoint
   * @param onOpen Handler for actions before the request is signed.
   * @param onRequestFail Handler for catching request failures.
   * @param onLoginError Handler for login errors.
   * @param onLoginClose Handler for login aborts (closed window).
   * @param onLoginSuccess Handler for login success.
   */
  generateloginHandler(
    signPath: string,
    onOpen: () => void,
    onRequestFail: () => void,
    onLoginError: () => void,
    onLoginClose: () => void,
    onLoginSuccess: (data: any) => void
  ): () => void;
  removeListener(): void;
  
  #listener: EventListener;
  #window: Window;
}
