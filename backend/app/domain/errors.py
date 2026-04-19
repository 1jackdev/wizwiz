class BaseValidationError(Exception):
    pass


class HandlerNotFoundError(Exception):
    pass


class EmailAlreadyExistsError(BaseValidationError):
    pass


class UnknownUserError(BaseValidationError):
    pass


class NameIsTooShortError(BaseValidationError):
    pass


class InvalidClassError(BaseValidationError):
    pass


class InvalidSpeciesError(BaseValidationError):
    pass


class InvalidLevelError(BaseValidationError):
    pass


class InvalidXPValueError(BaseValidationError):
    pass


class InvalidCredentialsError(BaseValidationError):
    pass


class NoUpdatesError(Exception):
    pass


class UserIsNotDmError(BaseValidationError):
    pass


class UnknownCampaignError(BaseValidationError):
    pass


class UnknownCharacterError(BaseValidationError):
    pass


class InvalidInviteCodeError(BaseValidationError):
    pass


class CharacterAlreadyInCampaignError(BaseValidationError):
    pass


class CharacterNotInCampaignError(BaseValidationError):
    pass


class NotCampaignOwnerError(BaseValidationError):
    pass
