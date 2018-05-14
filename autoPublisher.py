import fire
import praw
from config import config
from tqdm import tqdm
import time


class AutoPublisher(object):
    """A simple publisher for reddit and hackernews"""

    def __init__(self):
        self.reddit = praw.Reddit(client_id=config['redditAuth']['client_id'],
                                  client_secret=config['redditAuth']['client_secret'],
                                  user_agent=config['redditAuth']['user_agent'],
                                  username=config['redditAuth']['username'],
                                  password=config['redditAuth']['password'])

    def submitUrl(self, title, url):
        assert title, 'No title given'
        assert url, 'No url given'

        for subreddit in tqdm(config['subreddits']):
            self.reddit.subreddit(subreddit).submit(title, url=url).mod.distinguish(sticky=True)

            time.sleep(60 * 10)  # Sleep for 10 min


if __name__ == '__main__':
    fire.Fire(AutoPublisher)
