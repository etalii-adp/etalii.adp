/* Identity: the workspace, who is signed in, and the ways to sign in. */
import { Identity } from '../gen/adp/storage/v1/identity_pb';
import type { Link } from '../link';
import type { UserInfo } from '../views';

export class IdentityStore {
  workspace = '';
  user: UserInfo = { id: '', name: '', email: '', initials: '' };
  signedIn = false;
  providers: readonly string[] = [];

  constructor(private readonly link: Link) {}

  async load(): Promise<void> {
    const i = await this.link.call(Identity.method.read, {});
    this.workspace = i.workspace;
    this.signedIn = i.signedIn;
    this.providers = i.providers;
    if (i.user) this.user = { id: i.user.id, name: i.user.name, email: i.user.email, initials: i.user.initials };
  }
  /* each of them signs in, or is refused with the reason */
  async signIn(workspace: string, email: string, password: string, keep: boolean): Promise<void> { await this.link.call(Identity.method.signIn, { workspace, email, password, keep }); this.signedIn = true; }
  async singleSignOn(workspace: string): Promise<void> { await this.link.call(Identity.method.singleSignOn, { workspace }); this.signedIn = true; }
  async providerSignIn(workspace: string, provider: string): Promise<void> { await this.link.call(Identity.method.providerSignIn, { workspace, provider }); this.signedIn = true; }
  async signOut(): Promise<void> { await this.link.call(Identity.method.signOut, {}); this.signedIn = false; }
}
