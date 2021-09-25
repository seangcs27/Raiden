FROM alpine
COPY quickstart.sh /
RUN /bin/bash -c 'chmod +x /quickstart.sh'
CMD ["/quickstart.sh"]