from django import template

register = template.Library()

@register.filter(name='endswith')
def endswith(value, arg):
    if not isinstance(value, str):
        return False
    return value.endswith(arg)


@register.filter
def lastpart(value):
    return value.split('/')[-1]

@register.filter
def ordinal(value):
    try:
        value = int(value)
        if 10 <= value % 100 <= 20:
            suffix = 'th'
        else:
            suffix = {1: 'st', 2: 'nd', 3: 'rd'}.get(value % 10, 'th')
        return str(value) + suffix
    except (ValueError, TypeError):
        return value