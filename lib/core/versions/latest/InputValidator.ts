import Encoder from './Encoder';
import ErrorCode from './ErrorCode';
import Multihash from './Multihash';
import ProtocolParameters from './ProtocolParameters';
import SidetreeError from '../../../common/SidetreeError';

/**
 * Class containing generic input validation methods.
 */
export default class InputValidator {
  /**
   * Validates that the given input is of a non-array object type.
   * @param inputContextForErrorLogging This string is used for error logging purposes only. e.g. 'document', or 'suffix data'.
   */
  public static validateNonArrayObject (input: any, inputContextForErrorLogging: string) {
    if (typeof input !== 'object') {
      throw new SidetreeError(ErrorCode.InputValidatorInputIsNotAnObject, `Input ${inputContextForErrorLogging} is not an object.`);
    }

    if (Array.isArray(input)) {
      throw new SidetreeError(ErrorCode.InputValidatorInputCannotBeAnArray, `Input ${inputContextForErrorLogging} object cannot be an array.`);
    }
  }

  /**
   * Validates that the given object only contains allowed properties.
   * @param inputContextForErrorLogging This string is used for error logging purposes only. e.g. 'document', or 'suffix data'.
   */
  public static validateObjectContainsOnlyAllowedProperties (input: object, allowedProperties: string[], inputContextForErrorLogging: string) {
    const allowedPropertiesSet = new Set(allowedProperties);
    for (const property in input) {
      if (!allowedPropertiesSet.has(property)) {
        throw new SidetreeError(
          ErrorCode.InputValidatorInputContainsNowAllowedProperty,
          `Property '${property}' is not allowed in '${inputContextForErrorLogging}' object.`
        );
      }
    }
  }

  /**
   * Validates that the given input is a valid CAS File URI.
   * @param inputContextForErrorLogging This string is used for error logging purposes only. e.g. 'document', or 'suffix data'.
   */
  public static validateCasFileUri (casFileUri: any, inputContextForErrorLogging: string) {
    const casFileUriType = typeof casFileUri;
    if (casFileUriType !== 'string') {
      throw new SidetreeError(
        ErrorCode.InputValidatorCasFileUriNotString,
        `Input ${inputContextForErrorLogging} CAS file URI '${casFileUri}' needs to be of string type, but is of ${casFileUriType} type instead.`
      );
    }

    const casFileUriAsHashBuffer = Encoder.decodeAsBuffer(casFileUri);
    const hashAlgorithmInMultihashCode = ProtocolParameters.hashAlgorithmInMultihashCode;
    if (!Multihash.isComputedUsingHashAlgorithm(casFileUriAsHashBuffer, hashAlgorithmInMultihashCode)) {
      throw new SidetreeError(
        ErrorCode.InputValidatorCasFileUriUnsupported,
        `Input ${inputContextForErrorLogging} CAS file URI '${casFileUri}' is not computed using hash algorithm of code ${hashAlgorithmInMultihashCode}.`
      );
    }
  }

  /**
   * Validates the given recover/deactivate/update operation references.
   */
  public static validateOperationReferences (operationReferences: any[], inputContextForErrorLogging: string) {
    for (const operationReference of operationReferences) {
      InputValidator.validateObjectContainsOnlyAllowedProperties(operationReference, ['didSuffix', 'revealValue'], `${inputContextForErrorLogging} operation reference`);

      const didSuffixType = typeof operationReference.didSuffix;
      if (didSuffixType !== 'string') {
        throw new SidetreeError(
          ErrorCode.OperationReferenceDidSuffixIsNotAString,
          `Property 'didSuffix' in ${inputContextForErrorLogging} operation reference is of type ${didSuffixType}, but needs to be a string.`
        );
      }

      const revealValueType = typeof operationReference.revealValue;
      if (revealValueType !== 'string') {
        throw new SidetreeError(
          ErrorCode.OperationReferenceRevealValueIsNotAString,
          `Property 'revealValue' in ${inputContextForErrorLogging} operation reference is of type ${revealValueType}, but needs to be a string.`
        );
      }
    }
  }

  /**
   * Validates the given suffix data.
   */
  public static validateSuffixData (suffixData: any) {
    InputValidator.validateNonArrayObject(suffixData, 'suffix data');
    InputValidator.validateObjectContainsOnlyAllowedProperties(suffixData, ['deltaHash', 'recoveryCommitment', 'type'], `suffix data`);

    const deltaHash = Encoder.decodeAsBuffer(suffixData.deltaHash);
    const nextRecoveryCommitment = Encoder.decodeAsBuffer(suffixData.recoveryCommitment);
    Multihash.verifyHashComputedUsingLatestSupportedAlgorithm(deltaHash);
    Multihash.verifyHashComputedUsingLatestSupportedAlgorithm(nextRecoveryCommitment);

    InputValidator.validateDidType(suffixData.type);
  }

  private static validateDidType (type: string | undefined): void {
    // Nothing to verify if type is undefined, since it is an optional property.
    if (type === undefined) {
      return;
    }

    // `type` has to be max 4 character long string with only Base64URL character set.

    const typeOfType = typeof type;
    if (typeOfType !== 'string') {
      throw new SidetreeError(ErrorCode.SuffixDataTypeIsNotString, `DID type must be a string, but is of type ${typeOfType}.`);
    }

    if (type.length > 4) {
      throw new SidetreeError(ErrorCode.SuffixDataTypeLengthGreaterThanFour, `DID type string '${type}' cannot be longer than 4 characters.`);
    }

    if (!Encoder.isBase64UrlString(type)) {
      throw new SidetreeError(ErrorCode.SuffixDataTypeInvalidCharacter, `DID type string '${type}' contains a non-Base64URL character.`);
    }
  }
}