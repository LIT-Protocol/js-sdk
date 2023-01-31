import { Base64 } from 'js-base64';

// TODO: use new ReCap x UCAN compatible format
export class SessionCapabilityObject {
  private def?: string[];
  private tar?: { [key: string]: string[] };
  private ext?: { [key: string]: string };

  constructor() {}

  /**
   *
   * Checks whether the session capability object is empty.
   *
   * @returns { boolean } true if the session capability object is empty.
   *
   */
  isEmpty(): boolean {
    return (
      this.def === undefined && this.tar === undefined && this.ext === undefined
    );
  }

  /**
   *
   * Gets the capable actions for all resources.
   *
   * @returns { string[] } the capable actions for all resources.
   *
   */
  getCapableActionsForAllResources(): string[] {
    return this.def ? this.def : [];
  }

  /**
   *
   * Adds a capability to perform the given action for all resources.
   *
   */
  setCapableActionsForAllResources(actions: string[]): void {
    this.def = actions;
  }

  /**
   *
   * Adds a capability to perform the given action for the given resource.
   *
   * @param resourceId is the resource to add the capability for.
   * @param action is the action to add the capability for.
   *
   */
  addCapableActionForResource(resourceId: string, action: string): void {
    if (this.tar === undefined) {
      this.tar = {};
    }

    if (this.tar[resourceId] === undefined) {
      this.tar[resourceId] = [];
    }

    // Check if action already exists.
    if (this.tar[resourceId].indexOf(action) !== -1) {
      return;
    }

    this.tar[resourceId].push(action);
  }

  /**
   *
   * Encodes the session capability object as a SIWE resource string.
   *
   * Context: The SIWE ReCap standard encodes the session capability object as a resource.
   *
   * @param { SessionCapabilityObject } sessionCapabilityObject is the session capability object.
   * @returns { string } the encoded resource string.
   *
   */
  encodeAsSiweResource(): string {
    return `urn:recap:lit:session:${Base64.encode(
      JSON.stringify(this.#getAsObject())
    )}`;
  }

  /**
   *
   * Checks whether the session capability object has the given capabilities to perform the given action
   * for the given resource.
   *
   * @param action is the action to check for capabilities.
   * @param resourceId is the resource to check for capabilities.
   * @returns { boolean } true if the session capability object has the given capabilities to perform the given action.
   *
   */
  hasCapabilitiesForResource = (
    action: string,
    resourceId: string
  ): boolean => {
    // first check default permitted actions
    if (this.def) {
      for (const defaultAction of this.def) {
        if (defaultAction === '*' || defaultAction === action) {
          return true;
        }
      }
    }

    // then check specific targets
    if (this.tar) {
      if (Object.keys(this.tar).indexOf(resourceId) === -1) {
        return false;
      }

      for (const permittedAction of this.tar[resourceId]) {
        if (permittedAction === '*' || permittedAction === action) {
          return true;
        }
      }
    }

    return false;
  };

  #getAsObject = (): object => {
    const obj: { [key: string]: any } = {};

    if (this.def) {
      obj['def'] = this.def;
    }

    if (this.tar) {
      obj['tar'] = this.tar;
    }

    if (this.ext) {
      obj['ext'] = this.ext;
    }

    return obj;
  };
}
