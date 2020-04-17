/**
 * Peform tests to ensure that the taskCOnfiguration and thus the parameters that are
 * passed are correct and that the assumptions that have been made are sound
 */

// Import libraries --------------------------------------------------
// - local libs
import { TaskConfiguration } from "../src/common/taskConfiguration";

// - External task libs
import * as tl from "azure-pipelines-task-lib";
import * as rimraf from "rimraf";

// - Standard libs
import { join as pathJoin } from "path";
import { mkdirSync, existsSync } from "fs";

// - Test libraries
import { expect } from "chai";
import * as sinon from "sinon";
import * as os from "os";

// -------------------------------------------------------------------

// Configure constants
const WINDOWS = "win32";
const LINUX = "linux";
const MACOS = "darwin";

// Declare properties
let inputs = {};
let platform;
let tlsetResult;
let getInput;
let tc: TaskConfiguration;

// define a tempdir that the scripts can be written out to
function tempDir(remove: boolean = false): string {

  let path = pathJoin(__dirname, "temp");

  if (remove) {
    rimraf.sync(path);
  } else {
    if (!existsSync(path)) {
      mkdirSync(path);
    }
  }

  return path;
}



describe("Task Configuration", () => {

  before(() => {

    // stub out the getInputs from the azure devops task library
    getInput = sinon.stub(tl, "getInput").callsFake((name) => {
      return inputs[name];
    });
  
    // stub out the platform function from the os object
    platform = sinon.stub(os, "platform").callsFake(() => {
      return inputs["platform"];
    });
  
    // stub the azdo tasklib setResult function
    tlsetResult = sinon.stub(tl, "setResult");

    process.env.AGENT_TEMPDIRECTORY = tempDir();
  });

  after(() => {
    getInput.restore();
    platform.restore();
    tlsetResult.restore();

    process.env.AGENT_TEMPDIRECTORY = "";
  });
  

  // Check that the platform is correctly detected as windows and that
  // the paths are setup correctly
  describe("Windows", () => {

    // Configure the platform being used and instantaiate the class
    before(() => {

      // set the platform to windows
      inputs = {
        "platform": WINDOWS
      };

      tc = new TaskConfiguration();
    });

    it("should detect running on Windows", () => {
      expect(tc.IsWindows).to.equal(true);
    });

    describe("Paths", () => {

      // define the paths to test
      let chefWorkstationDir = pathJoin("C:", "opscode", "chef-workstation");
      
      let binChef = pathJoin(chefWorkstationDir, "bin", "chef.bat");
      let binBerks = pathJoin(chefWorkstationDir, "bin", "berks.bat");
      let binInspec = pathJoin(chefWorkstationDir, "bin", "inspec.bat");
      let binKnife = pathJoin(chefWorkstationDir, "bin", "knife.bat");

      let pathScript = pathJoin(tempDir(false), "install.ps1");

      it(chefWorkstationDir, () => {
        expect(tc.Paths.ChefWorkstationDir).to.equal(chefWorkstationDir);
      });

      it (binChef, () => {
        expect(tc.Paths.Chef).to.equal(binChef);
      });

      it (binBerks, () => {
        expect(tc.Paths.Berks).to.equal(binBerks);
      });

      it (binInspec, () => {
        expect(tc.Paths.InspecEmbedded).to.equal(binInspec);
      });

      it (binKnife, () => {
        expect(tc.Paths.Knife).to.equal(binKnife);
      });

      it (pathScript, () => {
        expect(tc.Paths.Script).to.equal(pathScript);
      });
    });
  });

  // Ensure that the paths are setup correctly for Linux
  describe("Linux", () => {
    // Configure the platform being used and instantaiate the class
    before(() => {

      // set the platform to windows
      inputs = {
        "platform": LINUX
      };

      tc = new TaskConfiguration();
    });

    it("should detect NOT running on Windows", () => {
      expect(tc.IsWindows).to.equal(false);
    });

    describe("Paths", () => {

      // define the paths to test
      let chefWorkstationDir = pathJoin("/", "opt", "chef-workstation");
      
      let binChef = pathJoin(chefWorkstationDir, "bin", "chef");
      let binBerks = pathJoin(chefWorkstationDir, "bin", "berks");
      let binInspec = pathJoin(chefWorkstationDir, "bin", "inspec");
      let binKnife = pathJoin(chefWorkstationDir, "bin", "knife");

      let pathScript = pathJoin(tempDir(false), "install.sh");

      it(chefWorkstationDir, () => {
        expect(tc.Paths.ChefWorkstationDir).to.equal(chefWorkstationDir);
      });

      it (binChef, () => {
        expect(tc.Paths.Chef).to.equal(binChef);
      });

      it (binBerks, () => {
        expect(tc.Paths.Berks).to.equal(binBerks);
      });

      it (binInspec, () => {
        expect(tc.Paths.InspecEmbedded).to.equal(binInspec);
      });

      it (binKnife, () => {
        expect(tc.Paths.Knife).to.equal(binKnife);
      });

      it (pathScript, () => {
        expect(tc.Paths.Script).to.equal(pathScript);
      });
    });
  });

  // ensure that an error is thrown when an unknown OS is presented
  describe("Unsupported platform", () => {

    // Configure the platform being used and instantaiate the class
    before(() => {

      // set the platform to windows
      inputs = {
        "platform": MACOS
      };

      tc = new TaskConfiguration();
    });    

    it("should report that the platform the task is running on is not supported", () => {
      sinon.assert.called(tlsetResult);
    });
  });

  /*
  // ensure that the environment variables are set when the EnvVar input is specified
  describe("Environment Variables", () => {

    // configure the necessary inputs
    before(() => {

      inputs = {
        "platform": LINUX, // setting the platform as the extension requires it, but it is no required for this test
        "envvars": "FRED=bloggs\nFOO=bar"
      };

      tc = new TaskConfiguration();
    });
  });
  */

});
