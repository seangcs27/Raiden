FROM alpine
COPY quickstart.sh /
RUN /bin/sh -c 'chmod +x /quickstart.sh'
CMD ["/quickstart.sh"]