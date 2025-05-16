#Run with frozen time for datetime.now calls
import sys
#pip install freezegun
from freezegun import freeze_time
script = sys.argv[1]
if len(script):
    #Enable test mode
    import lavavu
    lavavu.settings['test_mode'] = True #Force testing mode
    with freeze_time("2025-01-01 12:00AM GMT"):
        exec(open(script).read(), globals(), locals())
else:
    print('Requires script to run as first argument')
