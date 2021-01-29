// Start of a settings-like file.
import {couchdbHost, couchdbPort} from "./couchdbconfig.js";

export default
  {
    // host: "http://localhost:5984/"
    host: couchdbHost + ":" + couchdbPort + "/",
    publicRepository: "https://localhost:6984/repository/"
  };
