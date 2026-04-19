from app.domain.errors import HandlerNotFoundError
from app.domain.handlers import command, event
from app.domain.messages import (
    CampaignCharacterAdded,
    CampaignCreated,
    CharacterCreated,
    CreateCampaign,
    CreateCharacter,
    CreateNpc,
    CreateUser,
    JoinCampaign,
    Message,
    PromoteToDm,
    UserCreated,
    UserPromotedToDm,
)

HANDLERS: dict[type[Message], list[type]] = {
    # commands
    CreateCharacter: [command.CreateCharacterHandler],
    CreateUser: [command.CreateUserHandler],
    PromoteToDm: [command.PromoteToDmHandler],
    CreateNpc: [command.CreateNpcHandler],
    CreateCampaign: [command.CreateCampaignHandler],
    JoinCampaign: [command.JoinCampaignHandler],
    # events
    CharacterCreated: [event.CreateCharacter],
    UserCreated: [event.CreateUser],
    UserPromotedToDm: [event.PromoteUserToDm],
    CampaignCreated: [event.CreateCampaign],
    CampaignCharacterAdded: [event.PersistCampaignCharacterAdded],
}


class MessageBus:
    def __init__(self, handler_providers):  # type: ignore
        self.handler_providers = {
            provider.cls: provider for provider in handler_providers
        }
        self.queue = []

    def handle_msg(self, *received: Message) -> None:
        self.queue.extend(received)
        while self.queue:
            msg = self.queue.pop(0)
            self._handle_single_msg(msg)

    def _handlers_for(self, message: Message) -> list[type]:
        try:
            return [
                self.handler_providers[handler_class]()
                for handler_class in HANDLERS[type(message)]
            ]
        except KeyError:
            raise HandlerNotFoundError(
                f"No handler found for message type {type(message)}"
            )

    def _handle_single_msg(self, msg: Message) -> None:
        for handler in self._handlers_for(msg):
            output = handler(msg) or ()
            if isinstance(output, (tuple, list)):
                self.queue.extend(output)
            else:
                self.queue.append(output)
