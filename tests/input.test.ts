import * as core from '@actions/core';

import { ArgumentError } from '../src/errors';
import { ConfigFormat } from '../src/configfile';
import { getInput } from '../src/input'

let mockInput: any;

jest.mock('@actions/core', () => {
    return {
        getInput: jest.fn((name: string, options?: core.InputOptions) => {
            const input = mockInput[name];
           
            if (!input && options && options.required) {
                throw new Error(`Input missing: ${name}`);
            }

            return input;
        }),
        error: jest.fn((message: string) => {
        })
    };
});

describe('input', () => {

    beforeEach(() => {
        process.env.GITHUB_WORKSPACE = "defaultWorkspace"
        mockInput = {};
    })

    function getDefaultInput() {
        return {
            configurationFile: "defaultConfigFile",
            format: "json",
            connectionString: "Endpoint=https://default.azconfig.io;Id=default;Secret=default",
            separator: ":",
            strict: "true",
        };
    }

    it('default input is valid', () => {
        mockInput = getDefaultInput();

        expect(() => getInput()).not.toThrow();
    })

    it('validation succeeds with valid workspace', () => {
        process.env.GITHUB_WORKSPACE = "workspace";
        mockInput = getDefaultInput();

        const input = getInput();
        expect(input.workspace).toBe("workspace");
    })

    it('validation fails if workspace is missing', () => {
        delete process.env.GITHUB_WORKSPACE;
        mockInput = getDefaultInput();

        expect(() => getInput()).toThrowError(ArgumentError);
    })

    it('validation succeeds with configurationFile', () => {
        mockInput = getDefaultInput();
        mockInput.configurationFile = "configFile";

        const input = getInput();
        expect(input.configFile).toBe("configFile");
    })
    
    it('validation fails if configurationFile is missing', () => {
        mockInput = getDefaultInput();
        mockInput.configurationFile = undefined;

        expect(() => getInput()).toThrowError(ArgumentError);
    })
    
    it('validation succeeds with format: json', () => {
        mockInput = getDefaultInput();
        mockInput.format = "json";

        const input = getInput();
        expect(input.format).toBe(ConfigFormat.JSON);
    })

    it('validation succeeds with format: yaml', () => {
        mockInput = getDefaultInput();
        mockInput.format = "yaml";

        const input = getInput();
        expect(input.format).toBe(ConfigFormat.YAML);
    })

    it('validation succeeds with format: properties', () => {
        mockInput = getDefaultInput();
        mockInput.format = "properties";

        const input = getInput();
        expect(input.format).toBe(ConfigFormat.Properties);
    })

    it('validation fails if format is missing', () => {
        mockInput = getDefaultInput();
        mockInput.format = undefined;

        expect(() => getInput()).toThrowError(ArgumentError);
    })

    it('validation fails if format is invalid', () => {
        mockInput = getDefaultInput();
        mockInput.format = "invalid";

        expect(() => getInput()).toThrowError(ArgumentError);
    })

    it('validation succeeds with connectionString', () => {
        mockInput = getDefaultInput();
        mockInput.connectionString = "Endpoint=https://example.azconfig.io;Id=Id;Secret=Secret";

        const input = getInput();
        expect(input.connectionString).toBe("Endpoint=https://example.azconfig.io;Id=Id;Secret=Secret");
    })

    it('validation succeeds with connectionString with different segment order', () => {
        mockInput = getDefaultInput();
        mockInput.connectionString = "Secret=Secret;Id=Id;Endpoint=https://example.azconfig.io";

        const input = getInput();
        expect(input.connectionString).toBe("Secret=Secret;Id=Id;Endpoint=https://example.azconfig.io");
    })

    it('validation fails if connectionString is missing', () => {
        mockInput = getDefaultInput();
        mockInput.connectionString = undefined;
    
        expect(() => getInput()).toThrowError(ArgumentError);
    })

    it('validation fails if connectionString is invalid', () => {
        mockInput = getDefaultInput();
        mockInput.connectionString = "invalid";

        expect(() => getInput()).toThrowError(ArgumentError);
    })

    it('validation fails if connectionString has invalid segment', () => {
        mockInput = getDefaultInput();
        mockInput.connectionString = "Endpoint=https://example.azconfig.io;Id=Id;Unknown=Other";

        expect(() => getInput()).toThrowError(ArgumentError);
    })

    it('validation fails if connectionString is missing EndPoint', () => {
        mockInput = getDefaultInput();
        mockInput.connectionString = "Id=Id;Secret=Secret";

        expect(() => getInput()).toThrowError(ArgumentError);
    })

    it('validation fails if connectionString is missing Id', () => {
        mockInput = getDefaultInput();
        mockInput.connectionString = "Endpoint=https://example.azconfig.io;Secret=Secret";

        expect(() => getInput()).toThrowError(ArgumentError);
    })

    it('validation fails if connectionString is missing Secret', () => {
        mockInput = getDefaultInput();
        mockInput.connectionString = "Endpoint=https://example.azconfig.io;Id=Id";

        expect(() => getInput()).toThrowError(ArgumentError);
    })

    it('validation succeeds with separator: .', () => {
        verifySeparator(".");
    })

    it('validation succeeds with separator: ,', () => {
        verifySeparator(",");
    })

    it('validation succeeds with separator: ;', () => {
        verifySeparator(";");
    })

    it('validation succeeds with separator: -', () => {
        verifySeparator("-");
    })

    it('validation succeeds with separator: _', () => {
        verifySeparator("_");
    })

    it('validation succeeds with separator: __', () => {
        verifySeparator("__");
    })

    it('validation succeeds with separator: /', () => {
        verifySeparator("/");
    })

    it('validation succeeds with separator: :', () => {
        verifySeparator(":");
    })

    it('validation fails if separator is missing', () => {
        mockInput = getDefaultInput();
        mockInput.separator = undefined;

        expect(() => getInput()).toThrowError(ArgumentError);
    })

    it('validation fails if separator is invalid', () => {
        mockInput = getDefaultInput();
        mockInput.separator = "invalid";

        expect(() => getInput()).toThrowError(ArgumentError);
    })

    it('validation succeeds with strict: true', () => {
        mockInput = getDefaultInput();
        mockInput.strict = "true";

        const input = getInput();
        expect(input.strict).toBe(true);
    })

    it('validation succeeds with strict: false', () => {
        mockInput = getDefaultInput();
        mockInput.strict = "false";

        const input = getInput();
        expect(input.strict).toBe(false);
    })

    it('validation succeeds with missing strict', () => {
        mockInput = getDefaultInput();
        mockInput.strict = undefined;

        const input = getInput();
        expect(input.strict).toBe(false);
    })

    it('validation fails if strict is invalid', () => {
        mockInput = getDefaultInput();
        mockInput.strict = "invalid";

        expect(() => getInput()).toThrowError(ArgumentError);
    })

    it('validation succeeds with missing prefix', () => {
        mockInput = getDefaultInput();
        mockInput.prefix = undefined;

        const input = getInput();
        expect(input.prefix).toBe(undefined);
    })

    it('validation succeeds with prefix', () => {
        mockInput = getDefaultInput();
        mockInput.prefix = "prefix";

        const input = getInput();
        expect(input.prefix).toBe("prefix");
    })

    it('validation succeeds with missing label', () => {
        mockInput = getDefaultInput();
        mockInput.label = undefined;

        const input = getInput();
        expect(input.label).toBe(undefined);
    })

    it('validation succeeds with label', () => {
        mockInput = getDefaultInput();
        mockInput.label = "label";

        const input = getInput();
        expect(input.label).toBe("label");
    })

    it('validation succeeds with missing depth', () => {
        mockInput = getDefaultInput();
        mockInput.depth = undefined;

        const input = getInput();
        expect(input.depth).toBe(undefined);
    })

    it('validation succeeds with positive depth', () => {
        mockInput = getDefaultInput();
        mockInput.depth = "1";

        const input = getInput();
        expect(input.depth).toBe(1);
    })

    it('validation fails with non numerical depth', () => {
        mockInput = getDefaultInput();
        mockInput.depth = "invalid";

        expect(() => getInput()).toThrowError(ArgumentError);
    })

    it('validation fails with negative depth', () => {
        mockInput = getDefaultInput();
        mockInput.depth = "-4";

        expect(() => getInput()).toThrowError(ArgumentError);
    })
    
    it('validation fails with zero depth', () => {
        mockInput = getDefaultInput();
        mockInput.depth = "0";

        expect(() => getInput()).toThrowError(ArgumentError);
    })

    it('validation fails with tag JSON', () => {
        mockInput = getDefaultInput();
        mockInput.tags = "{";

        expect(() => getInput()).toThrowError(ArgumentError);
    })

    it('validation fails with invalid tags', () => {
        mockInput = getDefaultInput();
        mockInput.tags = JSON.stringify({ A: { B: "foo" } });

        expect(() => getInput()).toThrowError(ArgumentError);
    })

    it('validation fails with multiple invalid tags', () => {
        mockInput = getDefaultInput();
        mockInput.tags = JSON.stringify({ A: { B: "foo" }, C: "foo", D: { E: "foo" } });

        expect(() => getInput()).toThrowError(ArgumentError);
    })

    it('validation succeeds with missing tags', () => {
        mockInput = getDefaultInput();
        mockInput.tags = undefined;

        const input = getInput();
        expect(input.tags).toBe(undefined);
    })

    it('validation succeeds with valid tags', () => {
        mockInput = getDefaultInput();
        mockInput.tags = JSON.stringify({ A: "foo" });

        const input = getInput();
        expect(input.tags).toEqual({ A: "foo" });
    })

    it('validation succeeds with multiple valid tags', () => {
        mockInput = getDefaultInput();
        mockInput.tags = JSON.stringify({ A: "foo", B: "foo" });

        const input = getInput();
        expect(input.tags).toEqual({ A: "foo", B: "foo" });
    })

    function verifySeparator(separator: string) {
        mockInput = getDefaultInput();
        mockInput.separator = separator

        const input = getInput();
        expect(input.separator).toBe(separator);
    }
})
