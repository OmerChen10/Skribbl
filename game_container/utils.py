import threading, time


class Timer():
    def __init__(self):
        self.done = threading.Event()

    def start(self, seconds):
        self.done.clear()
        threading.Thread(target=self.sleep, args=[seconds]).start()
        
    def sleep(self, seconds):
        time.sleep(seconds)
        self.done.set()
