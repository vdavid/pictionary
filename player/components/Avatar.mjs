export const Avatar = ({name, size}) => {
    // noinspection JSUnresolvedFunction,JSUnresolvedVariable
    return React.createElement('img', {
        src: 'data:image/svg+xml;base64,' + btoa(jdenticon.toSvg(name, size)),
        alt: 'Avatar of ' + name,
        width: size,
        height: size
    });
};