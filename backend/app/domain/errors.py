class BaseValidationError(Exception):
    pass


class HandlerNotFoundError(Exception):
    pass


class UsernameAlreadyExistsError(BaseValidationError):
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
