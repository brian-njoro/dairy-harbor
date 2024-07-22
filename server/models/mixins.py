# models/mixins.py

class UserMixin:
    @property
    def user_type(self):
        return self.__class__.__name__.lower()
