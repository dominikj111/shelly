import { describe, it } from "https://deno.land/std@0.224.0/testing/bdd.ts";

import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

import {
  areArgumentsSupported,
  areValidArguments,
  parseArgumentsToObject,
} from "./common.ts";

describe("areArgumentsSupported", () => {
  const mockedHelpText = `
  
      This is some help to describe the functionality of provided command.
  
      --option='some a'   some assignment
      --analysis=4        some other number assignment
      -a=5                some other number assignment
      -e, --enter, -m     enter the mole whole
      -b
  
      -x, -y              some
      --eks               multiline description
                          what makes sense
  
  `;

  it("recognizes supported arguments", () => {
    assertEquals(
      areArgumentsSupported(["-x", "--eks", "-m"], mockedHelpText),
      true
    );

    assertEquals(areArgumentsSupported(["--enter"], mockedHelpText), true);

    assertEquals(areArgumentsSupported(["-a=5"], mockedHelpText), true);
    assertEquals(areArgumentsSupported(["--analysis=4"], mockedHelpText), true);

    assertEquals(
      areArgumentsSupported(["--option=/some/path space/test"], mockedHelpText),
      true
    );

    assertEquals(
      areArgumentsSupported(
        ["--option='/some/path space/test'"],
        mockedHelpText
      ),
      true
    );
  });

  it("pass the value what will become JSON", () => {
    assertEquals(
      areArgumentsSupported(["--option='{a:12}'"], mockedHelpText),
      true
    );
  });

  it("pass when two same arguments provided", () => {
    assertEquals(areArgumentsSupported(["-e"], mockedHelpText), true);
    assertEquals(
      areArgumentsSupported(["-e", "--enter"], mockedHelpText),
      true
    );
    assertEquals(areArgumentsSupported(["-y", "-x"], mockedHelpText), true);
  });

  it("fails when required assignment is not provided", () => {
    assertEquals(areArgumentsSupported(["--option"], mockedHelpText), false);
  });

  it("checks arguments validity", () => {
    assertEquals(areValidArguments(["-k", "-o", "--somo"]), true);
    assertEquals(areValidArguments(["--option='/some/path space/test'"]), true);
    assertEquals(areValidArguments(["--option='/some/PATH space/test'"]), true);
    assertEquals(areValidArguments(["--option=/some/path space/test"]), true);
  });

  it("fails when invalid argument is provided", () => {
    assertEquals(areValidArguments(["-option"]), false);
    assertEquals(areValidArguments(["abc"]), false);
    assertEquals(areValidArguments(["4"]), false);
  });
});

describe("parseArgumentsToObject", () => {
  it("parses short flag", () => {
    assertEquals(parseArgumentsToObject(["-a"]), { a: true });
  });

  it("parses long flag", () => {
    assertEquals(parseArgumentsToObject(["--help"]), { help: true });
  });

  it("parses short assignment (number)", () => {
    assertEquals(parseArgumentsToObject(["-a=3"]), { a: 3 });
  });

  it("parses long assignment (number)", () => {
    assertEquals(parseArgumentsToObject(["--foo=42"]), { foo: 42 });
  });

  it("parses short assignment (string)", () => {
    assertEquals(parseArgumentsToObject(["-a=bar"]), { a: "bar" });
  });

  it("parses long assignment (string)", () => {
    assertEquals(parseArgumentsToObject(["--foo=bar"]), { foo: "bar" });
  });

  it("parses quoted assignment (single quotes)", () => {
    assertEquals(parseArgumentsToObject(["--foo='bar baz'"]), {
      foo: "bar baz",
    });
  });

  it("parses quoted assignment (double quotes)", () => {
    assertEquals(parseArgumentsToObject(['-a="baz"']), { a: "baz" });
  });

  it("last argument wins", () => {
    assertEquals(parseArgumentsToObject(["-a=1", "-a=2"]), { a: 2 });
  });

  it("ignores invalid arguments", () => {
    assertEquals(parseArgumentsToObject(["foo", "-a"]), { a: true });
  });

  it("parses multiple arguments", () => {
    assertEquals(parseArgumentsToObject(["-a", "-b=4"]), { a: true, b: 4 });
  });
});
